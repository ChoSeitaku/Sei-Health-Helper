import type { PostureAnalysis, PostureIssue, PostureMetrics, PostureRuleSettings } from './types'
import { defaultPostureRules } from './defaults'
import { clamp } from './utils'

type Landmark = { x: number; y: number; z?: number; visibility?: number }
export type PoseResults = { poseLandmarks?: Landmark[]; image?: CanvasImageSource }

type PoseInstance = {
  setOptions(options: Record<string, unknown>): void
  onResults(callback: (results: PoseResults) => void): void
  send(input: { image: HTMLVideoElement }): Promise<void>
  close?: () => void
}

type CameraInstance = { start(): Promise<void>; stop(): void }

type MediapipePoseModule = { Pose: new (options: { locateFile: (file: string) => string }) => PoseInstance; POSE_CONNECTIONS: unknown }
type MediapipeCameraModule = { Camera: new (video: HTMLVideoElement, options: { onFrame: () => Promise<void>; width: number; height: number }) => CameraInstance }
type DrawingModule = {
  drawConnectors(ctx: CanvasRenderingContext2D, landmarks: Landmark[], connections: unknown, options: Record<string, unknown>): void
  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: Landmark[], options: Record<string, unknown>): void
}

export const LANDMARK_INDEX = {
  nose: 0,
  left_eye: 2,
  right_eye: 5,
  left_ear: 7,
  right_ear: 8,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28
} as const

let pose: PoseInstance | null = null
let camera: CameraInstance | null = null
let poseModule: MediapipePoseModule | null = null
let drawingModule: DrawingModule | null = null
let history: PostureMetrics[] = []

function point(landmarks: Landmark[], index: number) {
  const value = landmarks[index]
  return value && (value.visibility ?? 1) > 0.35 ? value : undefined
}

function center(a?: Landmark, b?: Landmark): Landmark | undefined {
  if (!a || !b) return undefined
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z ?? 0) + (b.z ?? 0)) / 2, visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1) }
}

function angle(a: Landmark, b: Landmark, c: Landmark) {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y)
  if (mag === 0) return 180
  return Math.acos(clamp(dot / mag, -1, 1)) * 180 / Math.PI
}

export async function initializePose(onResults: (results: PoseResults) => void) {
  if (typeof window === 'undefined') throw new Error('MediaPipe Pose 只能在浏览器中运行')
  try {
    poseModule = await import('@mediapipe/pose') as unknown as MediapipePoseModule
    drawingModule = await import('@mediapipe/drawing_utils') as unknown as DrawingModule
    pose = new poseModule.Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` })
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, smoothSegmentation: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
    pose.onResults(onResults)
    return pose
  } catch (error) {
    throw new Error(error instanceof Error ? `MediaPipe 加载失败：${error.message}` : 'MediaPipe 加载失败')
  }
}

export async function startCamera(video: HTMLVideoElement, onFrame?: () => void, facingMode: 'user' | 'environment' = 'user') {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器不支持摄像头调用')
  }
  if (!pose) throw new Error('请先初始化 MediaPipe Pose')
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
  video.srcObject = stream
  await video.play()
  const cameraModule = await import('@mediapipe/camera_utils') as unknown as MediapipeCameraModule
  camera = new cameraModule.Camera(video, { onFrame: async () => { onFrame?.(); await pose?.send({ image: video }) }, width: 1280, height: 720 })
  await camera.start()
  return stream
}

export function stopCamera(video?: HTMLVideoElement | null) {
  camera?.stop()
  camera = null
  if (video?.srcObject instanceof MediaStream) {
    video.srcObject.getTracks().forEach((track) => track.stop())
    video.srcObject = null
  }
  pose?.close?.()
  pose = null
}

export function drawPose(canvas: HTMLCanvasElement, results: PoseResults) {
  if (!drawingModule || !poseModule || !results.poseLandmarks) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawingModule.drawConnectors(ctx, results.poseLandmarks, poseModule.POSE_CONNECTIONS, { color: '#22c55e', lineWidth: 4 })
  drawingModule.drawLandmarks(ctx, results.poseLandmarks, { color: '#f97316', lineWidth: 2, radius: 3 })
  ctx.restore()
}

export function detectHeadForward(landmarks: Landmark[], rules: PostureRuleSettings = defaultPostureRules) {
  const ear = center(point(landmarks, LANDMARK_INDEX.left_ear), point(landmarks, LANDMARK_INDEX.right_ear))
  const shoulder = center(point(landmarks, LANDMARK_INDEX.left_shoulder), point(landmarks, LANDMARK_INDEX.right_shoulder))
  if (!ear || !shoulder) return 0
  return Math.abs(ear.x - shoulder.x) > rules.headForwardThreshold ? Math.abs(ear.x - shoulder.x) : 0
}

export function detectHunchback(landmarks: Landmark[], rules: PostureRuleSettings = defaultPostureRules) {
  const ear = center(point(landmarks, LANDMARK_INDEX.left_ear), point(landmarks, LANDMARK_INDEX.right_ear))
  const shoulder = center(point(landmarks, LANDMARK_INDEX.left_shoulder), point(landmarks, LANDMARK_INDEX.right_shoulder))
  const hip = center(point(landmarks, LANDMARK_INDEX.left_hip), point(landmarks, LANDMARK_INDEX.right_hip))
  if (!ear || !shoulder || !hip) return 0
  const deviation = Math.abs(180 - angle(ear, shoulder, hip))
  return deviation > rules.spineAngleThreshold ? deviation : 0
}

export function detectShoulderTilt(landmarks: Landmark[], rules: PostureRuleSettings = defaultPostureRules) {
  const left = point(landmarks, LANDMARK_INDEX.left_shoulder)
  const right = point(landmarks, LANDMARK_INDEX.right_shoulder)
  if (!left || !right) return 0
  const tilt = Math.abs(left.y - right.y)
  return tilt > rules.shoulderTiltThreshold ? tilt : 0
}

export function detectBodyLean(landmarks: Landmark[], rules: PostureRuleSettings = defaultPostureRules) {
  const nose = point(landmarks, LANDMARK_INDEX.nose)
  const shoulder = center(point(landmarks, LANDMARK_INDEX.left_shoulder), point(landmarks, LANDMARK_INDEX.right_shoulder))
  const hip = center(point(landmarks, LANDMARK_INDEX.left_hip), point(landmarks, LANDMARK_INDEX.right_hip))
  if (!nose || !shoulder || !hip) return 0
  const centerX = (shoulder.x + hip.x) / 2
  const lean = nose.x - centerX
  return Math.abs(lean) > rules.bodyLeanThreshold ? lean : 0
}

function calculateStability(metrics: PostureMetrics) {
  const prev = history.at(-1)
  history = [...history.slice(-24), metrics]
  if (!prev) return 0
  return Math.abs(prev.headForwardRatio - metrics.headForwardRatio) + Math.abs(prev.shoulderTilt - metrics.shoulderTilt) + Math.abs(prev.spineAngle - metrics.spineAngle) / 100 + Math.abs(prev.bodyLean - metrics.bodyLean)
}

export function calculatePostureScore(metrics: PostureMetrics) {
  const penalty = metrics.headForwardRatio * 115 + metrics.shoulderTilt * 160 + metrics.spineAngle * 1.45 + Math.abs(metrics.bodyLean) * 145 + metrics.stability * 95
  return clamp(Math.round(100 - penalty), 0, 100)
}

export function analyzePose(landmarks: Landmark[], rules: PostureRuleSettings = defaultPostureRules): PostureAnalysis {
  // 这些检测基于 2D 关键点的启发式估算，仅用于习惯提醒，不是医学诊断。
  const bodyLean = detectBodyLean(landmarks, rules)
  const baseMetrics: PostureMetrics = {
    headForwardRatio: detectHeadForward(landmarks, rules),
    shoulderTilt: detectShoulderTilt(landmarks, rules),
    spineAngle: detectHunchback(landmarks, rules),
    bodyLean,
    stability: 0
  }
  const metrics = { ...baseMetrics, stability: calculateStability(baseMetrics) }
  const issues: PostureIssue[] = []
  if (metrics.headForwardRatio > 0) issues.push('head_forward')
  if (metrics.spineAngle > 0) issues.push('rounded_back')
  if (metrics.shoulderTilt > 0) issues.push('shoulder_tilt')
  if (bodyLean < -rules.bodyLeanThreshold) issues.push('body_lean_left')
  if (bodyLean > rules.bodyLeanThreshold) issues.push('body_lean_right')
  if (metrics.stability > rules.stabilityThreshold) issues.push('unstable_sitting')
  if (metrics.headForwardRatio > rules.headForwardThreshold * 1.3 && metrics.shoulderTilt > 0) issues.push('neck_tension')
  const score = calculatePostureScore(metrics)
  const status = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'warning' : 'bad'
  const suggestions = issueSuggestions(issues)
  return { score, issues, status, metrics, suggestions }
}

export function issueSuggestions(issues: string[]) {
  const map: Record<string, string> = {
    head_forward: '下巴微收，想象后脑勺向上延展。',
    rounded_back: '轻轻打开胸腔，肩胛骨向后下方靠拢。',
    shoulder_tilt: '放松双肩，轻耸肩后自然下沉。',
    body_lean_left: '把重量均匀分布在身体两侧，回到中线。',
    body_lean_right: '把重量均匀分布在身体两侧，回到中线。',
    unstable_sitting: '先稳定坐姿，双脚踩稳地面。',
    unstable_standing: '双脚均匀承重，保持自然呼吸。',
    neck_tension: '放松肩颈，不要耸肩或屏住呼吸。'
  }
  return issues.map((issue) => map[issue]).filter(Boolean)
}

export function issueLabel(issue: string) {
  const labels: Record<string, string> = {
    head_forward: '头前伸',
    rounded_back: '驼背',
    shoulder_tilt: '高低肩',
    body_lean_left: '身体左倾',
    body_lean_right: '身体右倾',
    unstable_sitting: '坐姿不稳',
    unstable_standing: '站姿不稳',
    neck_tension: '肩颈紧张'
  }
  return labels[issue] ?? issue
}

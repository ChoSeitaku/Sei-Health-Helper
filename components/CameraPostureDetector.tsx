"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, RotateCw, AlertTriangle } from 'lucide-react'
import type { AiPostureResponse, PostureAnalysis } from '@/lib/types'
import { initializePose, startCamera, stopCamera, drawPose, analyzePose, LANDMARK_INDEX } from '@/lib/posture-detector'
import { getPostureRules, getSettings } from '@/lib/storage'
import { requestPostureAdvice } from '@/lib/ai'
import { speak } from '@/lib/speech'
import { PostureSkeleton } from './PostureSkeleton'

type Status = 'idle' | 'loading' | 'active' | 'error'

export function CameraPostureDetector({ onAnalysis, onRecord }: { onAnalysis?: (analysis: PostureAnalysis) => void; onRecord?: (analysis: PostureAnalysis, advice: AiPostureResponse) => void }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null)
  const [advice, setAdvice] = useState<AiPostureResponse | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [adviceLoading, setAdviceLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const activeRef = useRef(false)
  const startTimeRef = useRef(0)

  const handleResults = useCallback((results: { poseLandmarks?: Array<{ x: number; y: number; z?: number; visibility?: number }>; image?: unknown }) => {
    if (!activeRef.current) return
    const canvas = canvasRef.current
    if (canvas && results.image) drawPose(canvas, results as Parameters<typeof drawPose>[1])
    if (!results.poseLandmarks || results.poseLandmarks.length < 25) return

    const rules = getPostureRules()
    const result = analyzePose(results.poseLandmarks, rules)
    setAnalysis(result)
    onAnalysis?.(result)
  }, [onAnalysis])

  const start = async () => {
    setError('')
    setStatus('loading')
    try {
      const video = videoRef.current
      if (!video) throw new Error('找不到视频元素')
      await initializePose(handleResults)
      const stream = await startCamera(video, undefined, facingMode)
      streamRef.current = stream
      activeRef.current = true
      startTimeRef.current = Date.now()
      setStatus('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : '摄像头或姿态检测启动失败')
      setStatus('error')
    }
  }

  const stop = () => {
    activeRef.current = false
    stopCamera(videoRef.current)
    streamRef.current = null
    setStatus('idle')
  }

  const switchCamera = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next)
    stop()
    setTimeout(() => { setFacingMode(next); start() }, 400)
  }

  const fetchAdvice = async () => {
    if (!analysis || analysis.issues.length === 0) return
    setAdviceLoading(true)
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const settings = getSettings()
    try {
      const response = await requestPostureAdvice({
        postureScore: analysis.score,
        issues: analysis.issues,
        metrics: { headForwardRatio: analysis.metrics.headForwardRatio, shoulderTilt: analysis.metrics.shoulderTilt, spineAngle: analysis.metrics.spineAngle, bodyLean: analysis.metrics.bodyLean, stability: analysis.metrics.stability },
        durationSeconds: duration,
        mode: 'sitting'
      })
      setAdvice(response)
      if (settings.speechEnabled) speak(response.advice, { rate: settings.speechRate, volume: settings.speechVolume })
      onRecord?.(analysis, response)
    } catch {
      setAdvice(null)
    } finally {
      setAdviceLoading(false)
    }
  }

  useEffect(() => { return () => { activeRef.current = false; stopCamera(videoRef.current) } }, [])

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div className="camera-stage">
        <video ref={videoRef} playsInline muted />
        <canvas ref={canvasRef} width={1280} height={720} />
        {status === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(15,33,27,.74)', color: 'white', borderRadius: 28 }}>
            <PostureSkeleton active={false} />
            <button className="btn btn-primary" style={{ marginTop: -40 }} onClick={start}><Camera size={18} />开启摄像头</button>
          </div>
        )}
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(15,33,27,.74)', color: 'white', borderRadius: 28 }}>
            <div><RotateCw size={32} style={{ animation: 'spin .8s linear infinite' }} /></div>
            <p>正在加载姿态模型...</p>
          </div>
        )}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(15,33,27,.74)', color: 'white', borderRadius: 28, padding: 24 }}>
            <AlertTriangle size={36} color="var(--warning)" />
            <p style={{ textAlign: 'center' }}>{error}</p>
            <button className="btn btn-warning" onClick={() => { setStatus('idle'); setError('') }}>重试</button>
          </div>
        )}
        {status === 'active' && (
          <div className="camera-overlay">
            <button className="btn btn-danger" onClick={stop}><CameraOff size={16} />关闭</button>
            <button className="btn btn-ghost" onClick={switchCamera}><RotateCw size={16} />切换</button>
          </div>
        )}
      </div>

      {analysis && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="score-ring" style={{ '--score': analysis.score } as React.CSSProperties}>
            <div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{analysis.score}</div>
              <div className="muted" style={{ fontSize: 13 }}>{analysis.status === 'excellent' ? '优秀' : analysis.status === 'good' ? '良好' : analysis.status === 'warning' ? '注意' : '需改善'}</div>
            </div>
          </div>
          {analysis.issues.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
              {analysis.issues.map((issue) => (
                <span key={issue} className="badge" style={{ background: 'rgba(239,68,68,.12)', color: 'var(--danger)' }}>{issue}</span>
              ))}
            </div>
          )}
          {analysis.suggestions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {analysis.suggestions.map((s, i) => <p key={i} className="muted" style={{ margin: 0 }}>{s}</p>)}
            </div>
          )}
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={fetchAdvice} disabled={adviceLoading}>
            {adviceLoading ? <RotateCw size={16} style={{ animation: 'spin .8s linear infinite' }} /> : null}
            {adviceLoading ? '获取建议中...' : '获取 AI 建议'}
          </button>
        </div>
      )}

      {advice && (
        <div className="card">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span className="badge" style={{ background: advice.severity === 'high' ? 'rgba(239,68,68,.16)' : advice.severity === 'medium' ? 'rgba(245,158,11,.16)' : 'rgba(16,185,129,.16)', color: advice.severity === 'high' ? 'var(--danger)' : advice.severity === 'medium' ? 'var(--warning)' : 'var(--primary)' }}>
              {advice.severity === 'high' ? '优先改善' : advice.severity === 'medium' ? '建议改善' : '保持良好'}
            </span>
            {advice.fallback ? <span className="badge">本地建议</span> : null}
          </div>
          <p style={{ margin: '0 0 12px', lineHeight: 1.7 }}>{advice.advice}</p>
          {advice.actions.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {advice.actions.map((action, i) => (
                <span key={i} className="badge" style={{ background: 'rgba(56,189,248,.12)', color: 'var(--secondary)' }}>{action}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

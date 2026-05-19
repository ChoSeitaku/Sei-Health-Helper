export type HabitType = 'posture' | 'kegel' | 'eye-care' | 'water' | 'neck'

export type Habit = {
  id: string
  name: string
  type: HabitType
  description: string
  enabled: boolean
  dailyGoal: number
  unit: string
  color: string
  icon: string
  createdAt: string
  updatedAt: string
}

export type TrainingCourse = {
  id: string
  habitType: 'kegel' | 'eye-care' | 'neck'
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  gender?: 'male' | 'female' | 'all'
  description: string
  durationSeconds: number
  actions: TrainingAction[]
  enabled: boolean
}

export type TrainingAction = {
  id: string
  name: string
  type: string
  instruction: string
  durationSeconds: number
  restSeconds: number
  repeat: number
  voiceText: string
}

export type HealthRecord = {
  id: string
  type: HabitType
  title: string
  durationSeconds?: number
  value?: number
  unit?: string
  score?: number
  details?: unknown
  createdAt: string
}

export type UserSettings = {
  nickname: string
  gender: 'male' | 'female' | 'unknown'
  ageRange: string
  workMode: string
  waterGoal: number
  speechEnabled: boolean
  speechRate: number
  speechVolume: number
  notificationEnabled: boolean
  aiAdviceEnabled: boolean
}

export type PostureRuleSettings = {
  headForwardThreshold: number
  shoulderTiltThreshold: number
  spineAngleThreshold: number
  bodyLeanThreshold: number
  stabilityThreshold: number
  issueDurationThreshold: number
  aiAdviceEnabled: boolean
}

export type ReminderSettings = {
  waterIntervalMinutes: number
  eyeCareIntervalMinutes: number
  sedentaryIntervalMinutes: number
  dailyTrainingGoal: number
  notificationEnabled: boolean
  speechEnabled: boolean
}

export type PostureMetrics = {
  headForwardRatio: number
  shoulderTilt: number
  spineAngle: number
  bodyLean: number
  stability: number
}

export type PostureIssue =
  | 'head_forward'
  | 'rounded_back'
  | 'shoulder_tilt'
  | 'body_lean_left'
  | 'body_lean_right'
  | 'unstable_sitting'
  | 'unstable_standing'
  | 'neck_tension'

export type PostureAnalysis = {
  score: number
  issues: PostureIssue[]
  status: 'excellent' | 'good' | 'warning' | 'bad'
  metrics: PostureMetrics
  suggestions: string[]
}

export type AiPostureRequest = {
  postureScore: number
  issues: string[]
  metrics: {
    headForwardRatio: number
    shoulderTilt: number
    spineAngle: number
    bodyLean?: number
    stability?: number
  }
  durationSeconds: number
  mode: 'sitting' | 'standing'
}

export type AiPostureResponse = {
  advice: string
  severity: 'low' | 'medium' | 'high'
  actions: string[]
  fallback?: boolean
}

export type StorageData = {
  settings: UserSettings
  habits: Habit[]
  courses: TrainingCourse[]
  records: HealthRecord[]
  postureRules: PostureRuleSettings
  reminders: ReminderSettings
}

export type ChartPoint = {
  date: string
  label: string
  value: number
  water?: number
  posture?: number
  kegel?: number
  eyeCare?: number
  neck?: number
}

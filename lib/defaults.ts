import type { Habit, PostureRuleSettings, ReminderSettings, TrainingCourse, UserSettings } from './types'

const now = new Date().toISOString()

export const defaultSettings: UserSettings = {
  nickname: '健康伙伴',
  gender: 'unknown',
  ageRange: '25-35',
  workMode: '久坐办公',
  waterGoal: 2000,
  speechEnabled: true,
  speechRate: 1,
  speechVolume: 0.9,
  notificationEnabled: false,
  aiAdviceEnabled: true
}

export const defaultPostureRules: PostureRuleSettings = {
  headForwardThreshold: 0.16,
  shoulderTiltThreshold: 0.06,
  spineAngleThreshold: 16,
  bodyLeanThreshold: 0.08,
  stabilityThreshold: 0.08,
  issueDurationThreshold: 5,
  aiAdviceEnabled: true
}

export const defaultReminders: ReminderSettings = {
  waterIntervalMinutes: 60,
  eyeCareIntervalMinutes: 45,
  sedentaryIntervalMinutes: 50,
  dailyTrainingGoal: 4,
  notificationEnabled: false,
  speechEnabled: true
}

export const defaultHabits: Habit[] = [
  { id: 'habit_posture', name: 'AI 体态检测', type: 'posture', description: '摄像头本地识别头前伸、驼背、高低肩和身体歪斜。', enabled: true, dailyGoal: 1, unit: '次', color: '#10b981', icon: 'ScanLine', createdAt: now, updatedAt: now },
  { id: 'habit_kegel', name: '提肛训练', type: 'kegel', description: '盆底肌收缩与放松训练，适合日常健康维护。', enabled: true, dailyGoal: 1, unit: '组', color: '#f59e0b', icon: 'Activity', createdAt: now, updatedAt: now },
  { id: 'habit_eye', name: '护眼训练', type: 'eye-care', description: '20-20-20、眨眼、远近焦点切换和眼球放松。', enabled: true, dailyGoal: 2, unit: '次', color: '#38bdf8', icon: 'Eye', createdAt: now, updatedAt: now },
  { id: 'habit_water', name: '喝水记录', type: 'water', description: '记录每日饮水量并设置浏览器提醒。', enabled: true, dailyGoal: 2000, unit: 'ml', color: '#0ea5e9', icon: 'Droplets', createdAt: now, updatedAt: now },
  { id: 'habit_neck', name: '颈椎放松', type: 'neck', description: '适合久坐人群的轻柔肩颈放松训练。', enabled: true, dailyGoal: 1, unit: '次', color: '#22c55e', icon: 'Flower2', createdAt: now, updatedAt: now }
]

const kegelBeginner = [
  { id: 'k1', name: '感知盆底肌', type: 'awareness', instruction: '想象正在中断排尿，轻轻向上收紧盆底肌，不要夹臀，不要憋气。', durationSeconds: 5, restSeconds: 8, repeat: 5, voiceText: '轻轻收紧，向上提，保持自然呼吸。放松。' },
  { id: 'k2', name: '快速收缩', type: 'quick', instruction: '快速收紧盆底肌 1 秒，然后完全放松。', durationSeconds: 1, restSeconds: 2, repeat: 10, voiceText: '收紧，放松。' },
  { id: 'k3', name: '持续保持', type: 'hold', instruction: '温和收紧盆底肌并保持 3 秒，然后完全放松。', durationSeconds: 3, restSeconds: 5, repeat: 6, voiceText: '收紧，保持，二，三，放松。' }
]

const eye2020 = [
  { id: 'e1', name: '远眺放松', type: 'focus_far', instruction: '看向 6 米外的物体，放松眼睛。', durationSeconds: 20, restSeconds: 0, repeat: 1, voiceText: '请看向远处，放松眼睛，保持二十秒。' },
  { id: 'e2', name: '缓慢眨眼', type: 'blink', instruction: '缓慢眨眼，滋润眼睛。', durationSeconds: 10, restSeconds: 2, repeat: 2, voiceText: '缓慢眨眼，让眼睛放松。' }
]

const neckForward = [
  { id: 'n1', name: '下巴后收', type: 'chin_tuck', instruction: '坐直或站直，下巴水平向后收，感觉后颈变长。', durationSeconds: 8, restSeconds: 5, repeat: 5, voiceText: '下巴轻轻后收，后颈拉长，保持自然呼吸。' },
  { id: 'n2', name: '肩胛后缩', type: 'scapular_retraction', instruction: '肩胛骨轻轻向后下方靠拢，胸口自然打开。', durationSeconds: 8, restSeconds: 5, repeat: 5, voiceText: '肩胛骨向后下方靠拢，肩膀放松，不要耸肩。' }
]

export const defaultCourses: TrainingCourse[] = [
  { id: 'course_kegel_beginner', habitType: 'kegel', name: '新手基础训练', level: 'beginner', gender: 'all', description: '温和感知盆底肌，建立正确收缩与完全放松的节奏。', durationSeconds: 160, actions: kegelBeginner, enabled: true },
  { id: 'course_kegel_sedentary', habitType: 'kegel', name: '久坐人群训练', level: 'beginner', gender: 'all', description: '适合久坐办公室人群的短时盆底肌激活。', durationSeconds: 180, actions: [...kegelBeginner, { id: 'k4', name: '呼吸配合', type: 'breath', instruction: '吸气放松，呼气时轻轻向上收紧。', durationSeconds: 4, restSeconds: 4, repeat: 8, voiceText: '呼气时轻轻收紧，吸气时完全放松。' }], enabled: true },
  { id: 'course_kegel_male', habitType: 'kegel', name: '男性强化训练', level: 'advanced', gender: 'male', description: '增加耐力保持时间，避免过度用力。', durationSeconds: 260, actions: [...kegelBeginner, { id: 'k5', name: '耐力保持', type: 'endurance', instruction: '以 60% 力度保持收缩，不憋气。', durationSeconds: 8, restSeconds: 8, repeat: 8, voiceText: '温和收紧，保持自然呼吸，不要憋气。' }], enabled: true },
  { id: 'course_kegel_female', habitType: 'kegel', name: '女性基础训练', level: 'beginner', gender: 'female', description: '温和建立盆底肌控制感，强调放松与呼吸。', durationSeconds: 180, actions: kegelBeginner, enabled: true },
  { id: 'course_kegel_postpartum', habitType: 'kegel', name: '产后恢复训练', level: 'beginner', gender: 'female', description: '轻柔训练，产后或术后请先咨询医生再使用。', durationSeconds: 140, actions: kegelBeginner.slice(0, 2), enabled: true },
  { id: 'course_eye_2020', habitType: 'eye-care', name: '20-20-20 护眼', level: 'beginner', description: '看向远处、眨眼和短暂闭眼，帮助屏幕休息。', durationSeconds: 44, actions: eye2020, enabled: true },
  { id: 'course_eye_relax', habitType: 'eye-care', name: '眼球放松训练', level: 'intermediate', description: '上下左右移动、顺时针转圈、远近焦点切换。', durationSeconds: 96, actions: [...eye2020, { id: 'e3', name: '眼球转动', type: 'rotate', instruction: '眼球缓慢顺时针转动，不要用力。', durationSeconds: 12, restSeconds: 3, repeat: 3, voiceText: '眼球缓慢转动，动作轻柔。' }, { id: 'e4', name: '远近切换', type: 'focus_switch', instruction: '在近处手指和远处物体之间切换焦点。', durationSeconds: 15, restSeconds: 4, repeat: 2, voiceText: '近处，远处，缓慢切换焦点。' }], enabled: true },
  { id: 'course_eye_close', habitType: 'eye-care', name: '闭眼恢复训练', level: 'beginner', description: '闭眼呼吸放松，适合午后或长时间屏幕后。', durationSeconds: 90, actions: [{ id: 'e5', name: '闭眼放松', type: 'close', instruction: '轻轻闭眼，肩膀放松，保持自然呼吸。', durationSeconds: 30, restSeconds: 5, repeat: 3, voiceText: '请闭上眼睛，放松眼周，保持自然呼吸。' }], enabled: true },
  { id: 'course_neck_3min', habitType: 'neck', name: '3 分钟肩颈放松', level: 'beginner', description: '轻柔肩颈活动，适合工作间隙。', durationSeconds: 180, actions: [...neckForward, { id: 'n3', name: '耸肩放松', type: 'shoulder_release', instruction: '双肩轻轻上提，再自然落下。', durationSeconds: 6, restSeconds: 4, repeat: 6, voiceText: '肩膀轻轻上提，然后自然放下。' }], enabled: true },
  { id: 'course_neck_office', habitType: 'neck', name: '久坐办公恢复', level: 'beginner', description: '下巴后收、肩胛后缩和胸椎打开。', durationSeconds: 210, actions: [...neckForward, { id: 'n4', name: '胸椎打开', type: 'thoracic_open', instruction: '双手打开，胸口自然展开，肩膀不要耸起。', durationSeconds: 10, restSeconds: 5, repeat: 5, voiceText: '胸口自然打开，肩膀放松。' }], enabled: true },
  { id: 'course_neck_forward', habitType: 'neck', name: '头前伸改善训练', level: 'intermediate', description: '改善头前伸趋势的轻柔动作组合。', durationSeconds: 130, actions: neckForward, enabled: true },
  { id: 'course_neck_hunch', habitType: 'neck', name: '驼背改善训练', level: 'intermediate', description: '打开胸腔，唤醒肩胛稳定。', durationSeconds: 160, actions: [...neckForward, { id: 'n5', name: '墙天使', type: 'wall_angel', instruction: '背靠墙，手臂在舒适范围内缓慢上滑。', durationSeconds: 10, restSeconds: 6, repeat: 5, voiceText: '手臂缓慢上滑，不要追求幅度。' }], enabled: true }
]

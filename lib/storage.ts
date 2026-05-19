import { defaultCourses, defaultHabits, defaultPostureRules, defaultReminders, defaultSettings } from './defaults'
import type { Habit, HealthRecord, PostureRuleSettings, ReminderSettings, StorageData, TrainingCourse, UserSettings } from './types'

export const STORAGE_KEYS = {
  SETTINGS: 'tgang_settings',
  HABITS: 'tgang_habits',
  COURSES: 'tgang_courses',
  RECORDS: 'tgang_records',
  POSTURE_RULES: 'tgang_posture_rules',
  REMINDERS: 'tgang_reminders'
} as const

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const value = window.localStorage.getItem(key)
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function initializeDefaultData() {
  if (!canUseStorage()) return
  if (!window.localStorage.getItem(STORAGE_KEYS.SETTINGS)) saveSettings(defaultSettings)
  if (!window.localStorage.getItem(STORAGE_KEYS.HABITS)) saveHabits(defaultHabits)
  if (!window.localStorage.getItem(STORAGE_KEYS.COURSES)) saveCourses(defaultCourses)
  if (!window.localStorage.getItem(STORAGE_KEYS.RECORDS)) writeJson(STORAGE_KEYS.RECORDS, [])
  if (!window.localStorage.getItem(STORAGE_KEYS.POSTURE_RULES)) savePostureRules(defaultPostureRules)
  if (!window.localStorage.getItem(STORAGE_KEYS.REMINDERS)) saveReminders(defaultReminders)
}

export const getSettings = () => readJson<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings)
export const saveSettings = (settings: UserSettings) => writeJson(STORAGE_KEYS.SETTINGS, settings)
export const getHabits = () => readJson<Habit[]>(STORAGE_KEYS.HABITS, defaultHabits)
export const saveHabits = (habits: Habit[]) => writeJson(STORAGE_KEYS.HABITS, habits)
export const getCourses = () => readJson<TrainingCourse[]>(STORAGE_KEYS.COURSES, defaultCourses)
export const saveCourses = (courses: TrainingCourse[]) => writeJson(STORAGE_KEYS.COURSES, courses)
export const getRecords = () => readJson<HealthRecord[]>(STORAGE_KEYS.RECORDS, [])
export const saveRecords = (records: HealthRecord[]) => writeJson(STORAGE_KEYS.RECORDS, records)
export const getPostureRules = () => readJson<PostureRuleSettings>(STORAGE_KEYS.POSTURE_RULES, defaultPostureRules)
export const savePostureRules = (rules: PostureRuleSettings) => writeJson(STORAGE_KEYS.POSTURE_RULES, rules)
export const getReminders = () => readJson<ReminderSettings>(STORAGE_KEYS.REMINDERS, defaultReminders)
export const saveReminders = (reminders: ReminderSettings) => writeJson(STORAGE_KEYS.REMINDERS, reminders)

export function addRecord(record: HealthRecord) {
  const records = getRecords()
  const next = [record, ...records]
  saveRecords(next)
  return next
}

export function deleteRecord(id: string) {
  const next = getRecords().filter((record) => record.id !== id)
  saveRecords(next)
  return next
}

export function exportData(): StorageData {
  return {
    settings: getSettings(),
    habits: getHabits(),
    courses: getCourses(),
    records: getRecords(),
    postureRules: getPostureRules(),
    reminders: getReminders()
  }
}

export function importData(value: string | StorageData) {
  try {
    const data = typeof value === 'string' ? JSON.parse(value) as Partial<StorageData> : value
    if (data.settings) saveSettings({ ...defaultSettings, ...data.settings })
    if (Array.isArray(data.habits)) saveHabits(data.habits)
    if (Array.isArray(data.courses)) saveCourses(data.courses)
    if (Array.isArray(data.records)) saveRecords(data.records)
    if (data.postureRules) savePostureRules({ ...defaultPostureRules, ...data.postureRules })
    if (data.reminders) saveReminders({ ...defaultReminders, ...data.reminders })
    return { ok: true as const }
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : '导入数据格式错误' }
  }
}

export function resetDefaultData() {
  saveSettings(defaultSettings)
  saveHabits(defaultHabits)
  saveCourses(defaultCourses)
  savePostureRules(defaultPostureRules)
  saveReminders(defaultReminders)
  saveRecords([])
}

export function clearAllRecords() {
  saveRecords([])
}

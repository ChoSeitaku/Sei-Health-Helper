import type { ChartPoint, HabitType, HealthRecord } from './types'
import { dateLabel, todayKey } from './utils'

function rangeDays(days: number) {
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - index))
    const key = todayKey(date)
    return { key, label: dateLabel(key) }
  })
}

export function recordsByToday(records: HealthRecord[]) {
  const key = todayKey()
  return records.filter((record) => record.createdAt.slice(0, 10) === key)
}

export function getTodaySummary(records: HealthRecord[]) {
  const today = recordsByToday(records)
  const countByType = (type: HabitType) => today.filter((record) => record.type === type).length
  return {
    completedHabits: new Set(today.map((record) => record.type)).size,
    water: today.filter((record) => record.type === 'water').reduce((sum, record) => sum + (record.value ?? 0), 0),
    eyeCare: countByType('eye-care'),
    neck: countByType('neck'),
    kegel: countByType('kegel'),
    posture: countByType('posture'),
    lastPostureScore: today.find((record) => record.type === 'posture')?.score ?? records.find((record) => record.type === 'posture')?.score ?? 0
  }
}

export function getTrend(records: HealthRecord[], days = 7): ChartPoint[] {
  return rangeDays(days).map(({ key, label }) => {
    const daily = records.filter((record) => record.createdAt.slice(0, 10) === key)
    const postureScores = daily.filter((record) => record.type === 'posture' && typeof record.score === 'number').map((record) => record.score ?? 0)
    return {
      date: key,
      label,
      value: new Set(daily.map((record) => record.type)).size,
      water: daily.filter((record) => record.type === 'water').reduce((sum, record) => sum + (record.value ?? 0), 0),
      posture: postureScores.length ? Math.round(postureScores.reduce((sum, score) => sum + score, 0) / postureScores.length) : 0,
      kegel: daily.filter((record) => record.type === 'kegel').length,
      eyeCare: daily.filter((record) => record.type === 'eye-care').length,
      neck: daily.filter((record) => record.type === 'neck').length
    }
  })
}

export function getStreakDays(records: HealthRecord[]) {
  const days = new Set(records.map((record) => record.createdAt.slice(0, 10)))
  let streak = 0
  const date = new Date()
  while (days.has(todayKey(date))) {
    streak += 1
    date.setDate(date.getDate() - 1)
  }
  return streak
}

export function getTotalTrainingSeconds(records: HealthRecord[]) {
  return records.reduce((sum, record) => sum + (record.durationSeconds ?? 0), 0)
}

export function getHabitDistribution(records: HealthRecord[]) {
  const labels: Record<HabitType, string> = { posture: '体态', kegel: '提肛', 'eye-care': '护眼', water: '喝水', neck: '颈椎' }
  return (Object.keys(labels) as HabitType[]).map((type) => ({ name: labels[type], value: records.filter((record) => record.type === type).length })).filter((item) => item.value > 0)
}

export function getMostUsedType(records: HealthRecord[]) {
  const distribution = getHabitDistribution(records).sort((a, b) => b.value - a.value)
  return distribution[0]?.name ?? '暂无记录'
}

export function getStats(records: HealthRecord[]) {
  return {
    today: getTodaySummary(records),
    sevenDayTrend: getTrend(records, 7),
    thirtyDayTrend: getTrend(records, 30),
    streakDays: getStreakDays(records),
    totalTrainingSeconds: getTotalTrainingSeconds(records),
    totalWater: records.filter((record) => record.type === 'water').reduce((sum, record) => sum + (record.value ?? 0), 0),
    distribution: getHabitDistribution(records),
    mostUsedType: getMostUsedType(records)
  }
}

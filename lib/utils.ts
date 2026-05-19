export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function dateLabel(dateString: string) {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function formatSeconds(seconds = 0) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (min <= 0) return `${sec} 秒`
  return `${min} 分 ${sec.toString().padStart(2, '0')} 秒`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === 'undefined') return
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export type SpeechOptions = {
  enabled?: boolean
  rate?: number
  volume?: number
  lang?: string
}

let lastText = ''
let lastTime = 0

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
}

export function getVoices() {
  if (!isSpeechSupported()) return []
  return window.speechSynthesis.getVoices()
}

export function speak(text: string, options: SpeechOptions = {}) {
  if (!options.enabled && options.enabled !== undefined) return false
  if (!isSpeechSupported() || !text.trim()) return false
  const now = Date.now()
  if (text === lastText && now - lastTime < 2500) return false
  lastText = text
  lastTime = now
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options.lang ?? 'zh-CN'
  utterance.rate = options.rate ?? 1
  utterance.volume = options.volume ?? 0.9
  const voice = getVoices().find((item) => item.lang.toLowerCase().startsWith('zh'))
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
  return true
}

import type { AiPostureRequest, AiPostureResponse } from './types'

export async function requestPostureAdvice(payload: AiPostureRequest): Promise<AiPostureResponse> {
  const response = await fetch('/api/ai/posture-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  if (!response.ok && data?.error?.message) {
    throw new Error(data.error.message)
  }
  return data as AiPostureResponse
}

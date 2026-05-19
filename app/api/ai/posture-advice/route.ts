import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { AiPostureRequest, AiPostureResponse } from '@/lib/types'

const fallbackMap: Record<string, string> = {
  head_forward: '检测到头部有前伸趋势。请下巴微微后收，想象后脑勺向上延展，肩膀自然下沉，保持自然呼吸。',
  rounded_back: '检测到上背部有弯曲趋势。请轻轻打开胸腔，肩胛骨向后下方靠拢，不要耸肩，保持放松呼吸。',
  shoulder_tilt: '检测到左右肩高度不一致。请放松双肩，轻轻耸肩后自然放下，感受两侧肩膀保持水平。',
  body_lean: '检测到身体有歪斜趋势。请把重量均匀分布在左右两侧，头部、肩膀和骨盆尽量保持在中线上。',
  body_lean_left: '检测到身体有左倾趋势。请把重量均匀分布在左右两侧，让头部、肩膀和骨盆回到中线。',
  body_lean_right: '检测到身体有右倾趋势。请把重量均匀分布在左右两侧，让头部、肩膀和骨盆回到中线。'
}

function fallbackAdvice(body: Partial<AiPostureRequest>): AiPostureResponse {
  const issues = body.issues ?? []
  const first = issues.find((issue) => fallbackMap[issue]) ?? 'head_forward'
  const actions = issues.includes('rounded_back')
    ? ['打开胸腔', '肩胛后下', '自然呼吸']
    : issues.includes('shoulder_tilt')
      ? ['放松双肩', '轻耸肩后放下', '保持水平']
      : issues.some((issue) => issue.startsWith('body_lean'))
        ? ['回到中线', '左右均匀承重', '自然呼吸']
        : ['下巴微收', '肩膀下沉', '后脑勺向上延展']
  return { advice: fallbackMap[first], severity: (body.postureScore ?? 80) < 60 ? 'high' : (body.postureScore ?? 80) < 75 ? 'medium' : 'low', actions, fallback: true }
}

function safeParseJson(content: string | null): Partial<AiPostureResponse> | null {
  if (!content) return null
  try {
    const json = content.match(/\{[\s\S]*\}/)?.[0] ?? content
    return JSON.parse(json) as Partial<AiPostureResponse>
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  let body: AiPostureRequest
  try {
    body = await request.json() as AiPostureRequest
  } catch {
    return NextResponse.json({ error: { message: '请求体不是有效 JSON', code: 'INVALID_JSON' } }, { status: 400 })
  }

  if (typeof body.postureScore !== 'number' || !Array.isArray(body.issues) || !body.metrics) {
    return NextResponse.json({ error: { message: '姿态数据字段不完整', code: 'INVALID_POSTURE_PAYLOAD' } }, { status: 400 })
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(fallbackAdvice(body))
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    })
    const completion = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一名健康姿态训练助手，专门根据浏览器端姿态检测数据，给出温和、安全、可执行的体态纠正建议。你不能进行医学诊断，不能声称用户患有疾病。你只能根据数据提示可能存在的姿态问题，并给出通用的健康建议。建议必须满足：1. 使用中文 2. 简短清晰 3. 面向普通用户 4. 每次建议不超过 120 字 5. 包含 2-4 个具体动作提示 6. 提醒自然呼吸 7. 如果出现疼痛、眩晕、麻木，应立即停止并咨询医生 8. 不得要求用户做危险动作 9. 不得提及你看到了用户图像，因为你只接收姿态数据，不接收图像。请只返回 JSON：{"advice":"...","severity":"low|medium|high","actions":["..."]}'
        },
        {
          role: 'user',
          content: JSON.stringify({
            postureScore: body.postureScore,
            issues: body.issues,
            metrics: body.metrics,
            durationSeconds: body.durationSeconds,
            mode: body.mode
          })
        }
      ],
      temperature: 0.3,
      max_tokens: 220
    })
    const parsed = safeParseJson(completion.choices[0]?.message?.content ?? null)
    if (!parsed?.advice || !Array.isArray(parsed.actions)) return NextResponse.json(fallbackAdvice(body))
    return NextResponse.json({ advice: parsed.advice.slice(0, 160), severity: parsed.severity ?? 'medium', actions: parsed.actions.slice(0, 4) })
  } catch {
    return NextResponse.json(fallbackAdvice(body))
  }
}

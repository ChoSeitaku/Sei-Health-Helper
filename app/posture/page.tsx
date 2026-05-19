"use client"

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Save } from 'lucide-react'
import type { AiPostureResponse, PostureAnalysis } from '@/lib/types'
import { CameraPostureDetector } from '@/components/CameraPostureDetector'
import { Disclaimer } from '@/components/Disclaimer'
import { addRecord } from '@/lib/storage'
import { uid } from '@/lib/utils'

export default function PosturePage() {
  const [lastAnalysis, setLastAnalysis] = useState<PostureAnalysis | null>(null)
  const [lastAdvice, setLastAdvice] = useState<AiPostureResponse | null>(null)
  const [saved, setSaved] = useState(false)

  const handleAnalysis = useCallback((analysis: PostureAnalysis) => {
    setLastAnalysis(analysis)
    setSaved(false)
  }, [])

  const handleRecord = useCallback((analysis: PostureAnalysis, advice: AiPostureResponse) => {
    setLastAdvice(advice)
    setSaved(false)
  }, [])

  const saveRecord = () => {
    if (!lastAnalysis) return
    addRecord({
      id: uid('posture'),
      type: 'posture',
      title: `体态评分 ${lastAnalysis.score} · ${lastAnalysis.status === 'excellent' ? '优秀' : lastAnalysis.status === 'good' ? '良好' : lastAnalysis.status === 'warning' ? '注意' : '需改善'}`,
      score: lastAnalysis.score,
      durationSeconds: 0,
      details: { issues: lastAnalysis.issues, metrics: lastAnalysis.metrics, advice: lastAdvice?.advice },
      createdAt: new Date().toISOString()
    })
    setSaved(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">AI 体态检测</h1>
          <p className="muted">摄像头画面在浏览器本地分析，不会上传到服务器。</p>
        </div>
        {lastAnalysis ? (
          <button className="btn btn-primary" onClick={saveRecord} disabled={saved}>
            <Save size={18} />{saved ? '已保存' : '保存记录'}
          </button>
        ) : null}
      </div>

      <CameraPostureDetector onAnalysis={handleAnalysis} onRecord={handleRecord} />

      <div className="card card-subtle" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Shield size={20} style={{ color: 'var(--primary)' }} />
        <p className="muted" style={{ margin: 0 }}>
          摄像头画面仅在本地浏览器中处理，不会上传服务器。发送给 AI 的只有姿态数据（评分、问题摘要），不包含图像或视频。AI 建议仅供参考。
        </p>
      </div>

      <Disclaimer />
    </motion.div>
  )
}

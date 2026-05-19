"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Save } from 'lucide-react'
import type { TrainingCourse } from '@/lib/types'
import { TrainingTimer } from '@/components/TrainingTimer'
import { KegelGuideAnimation } from '@/components/KegelGuideAnimation'
import { Disclaimer } from '@/components/Disclaimer'
import { getCourses, addRecord } from '@/lib/storage'
import { uid } from '@/lib/utils'

export default function KegelPage() {
  const courses = getCourses().filter((c) => c.habitType === 'kegel' && c.enabled)
  const [selected, setSelected] = useState<TrainingCourse>(courses[0])
  const [animPhase, setAnimPhase] = useState<'contract' | 'relax' | 'hold'>('hold')
  const [completed, setCompleted] = useState(false)

  const handleComplete = (totalSeconds: number) => {
    if (!selected) return
    addRecord({
      id: uid('kegel'),
      type: 'kegel',
      title: selected.name,
      durationSeconds: totalSeconds,
      details: { courseId: selected.id },
      createdAt: new Date().toISOString()
    })
    setCompleted(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 className="page-title">提肛 / 凯格尔训练</h1>
        <p className="muted">盆底肌收缩与放松训练，适合日常健康维护。如有盆底疼痛请先咨询医生。</p>
      </div>

      <div className="grid-2">
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="card">
            <div className="label">选择课程</div>
            <div className="tabs" style={{ marginTop: 10 }}>
              {courses.map((course) => (
                <button key={course.id} className={`tab ${selected?.id === course.id ? 'active' : ''}`} onClick={() => { setSelected(course); setCompleted(false) }}>
                  {course.name}
                </button>
              ))}
            </div>
            {selected ? (
              <div style={{ marginTop: 14 }}>
                <span className="badge">{selected.level === 'beginner' ? '新手' : selected.level === 'intermediate' ? '中级' : '进阶'}</span>
                <span className="badge" style={{ marginLeft: 8 }}>约 {Math.round(selected.durationSeconds / 60)} 分钟</span>
                <p className="muted" style={{ margin: '10px 0 0' }}>{selected.description}</p>
                {selected.actions.map((action) => (
                  <p key={action.id} className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>
                    <strong>{action.name}</strong>：{action.instruction}，{action.durationSeconds}s × {action.repeat} 组
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          {completed ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <Save size={28} color="var(--primary)" />
              <p style={{ margin: '10px 0 0', fontWeight: 700 }}>训练已记录！</p>
            </div>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <KegelGuideAnimation phase={animPhase} />
          {selected ? (
            <TrainingTimer key={selected.id} course={selected} onComplete={handleComplete} onTick={(phase) => {
              if (phase.kind === 'action') setAnimPhase('contract')
              else setAnimPhase('relax')
            }} />
          ) : null}
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}

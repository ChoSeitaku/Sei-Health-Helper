"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flower2, Save } from 'lucide-react'
import type { TrainingCourse } from '@/lib/types'
import { TrainingTimer } from '@/components/TrainingTimer'
import { NeckExerciseAnimation } from '@/components/NeckExerciseAnimation'
import { Disclaimer } from '@/components/Disclaimer'
import { getCourses, addRecord } from '@/lib/storage'
import { uid } from '@/lib/utils'

export default function NeckPage() {
  const courses = getCourses().filter((c) => c.habitType === 'neck' && c.enabled)
  const [selected, setSelected] = useState<TrainingCourse>(courses[0])
  const [animMode, setAnimMode] = useState<'chin' | 'shoulder' | 'open'>('chin')
  const [completed, setCompleted] = useState(false)

  const handleComplete = (totalSeconds: number) => {
    if (!selected) return
    addRecord({
      id: uid('neck'),
      type: 'neck',
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
        <h1 className="page-title">颈椎放松训练</h1>
        <p className="muted">轻柔的肩颈活动，适合久坐间隙。动作幅度请保持在舒适范围，如有疼痛立刻停止。</p>
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
              </div>
            ) : null}
          </div>
          {completed ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <Save size={28} color="var(--primary)" />
              <p style={{ margin: '10px 0 0', fontWeight: 700 }}>颈椎训练已记录！</p>
            </div>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <NeckExerciseAnimation mode={animMode} />
          {selected ? (
            <TrainingTimer key={selected.id} course={selected} onComplete={handleComplete} onTick={(phase) => {
              if (phase.action.type === 'chin_tuck') setAnimMode('chin')
              else if (phase.action.type === 'shoulder_release') setAnimMode('shoulder')
              else setAnimMode('open')
            }} />
          ) : null}
        </div>
      </div>

      <Disclaimer />
    </motion.div>
  )
}

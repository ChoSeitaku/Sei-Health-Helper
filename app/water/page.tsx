"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Minus, Plus, Trash2 } from 'lucide-react'
import { WaterCup } from '@/components/WaterCup'
import { RecordList } from '@/components/RecordList'
import { getRecords, getReminders, getSettings, addRecord, deleteRecord, saveReminders } from '@/lib/storage'
import { recordsByToday } from '@/lib/stats'
import { uid } from '@/lib/utils'
import type { HealthRecord, ReminderSettings } from '@/lib/types'

const quickAmounts = [100, 200, 300, 500]

export default function WaterPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [custom, setCustom] = useState(300)
  const [reminders, setReminders] = useState<ReminderSettings>(getReminders())
  const settings = getSettings()

  useEffect(() => {
    const update = () => setRecords(getRecords())
    update()
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [])

  const today = recordsByToday(records)
  const waterToday = today.filter((r) => r.type === 'water').reduce((sum, r) => sum + (r.value ?? 0), 0)

  const addWater = (ml: number) => {
    addRecord({ id: uid('water'), type: 'water', title: `喝水 ${ml}ml`, value: ml, unit: 'ml', createdAt: new Date().toISOString() })
    setRecords(getRecords())
  }

  const handleDelete = (id: string) => {
    deleteRecord(id)
    setRecords(getRecords())
  }

  const toggleReminder = (key: keyof ReminderSettings) => {
    const next = { ...reminders, [key]: !reminders[key] }
    setReminders(next)
    saveReminders(next)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 className="page-title">喝水记录</h1>
        <p className="muted">记录每日饮水量，保持身体水分充足。目标 {settings.waterGoal}ml/天。</p>
      </div>

      <div className="grid-2">
        <div className="card" style={{ textAlign: 'center' }}>
          <WaterCup current={waterToday} goal={settings.waterGoal} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
            {quickAmounts.map((ml) => (
              <button key={ml} className="btn" onClick={() => addWater(ml)}><Plus size={14} />{ml}ml</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={() => setCustom(Math.max(50, custom - 50))}><Minus size={14} /></button>
            <button className="btn btn-primary" onClick={() => addWater(custom)}>记录 {custom}ml</button>
            <button className="btn btn-ghost" onClick={() => setCustom(custom + 50)}><Plus size={14} /></button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 14px' }}>提醒设置</h3>
          <div className="label">
            <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={reminders.notificationEnabled} onChange={() => toggleReminder('notificationEnabled')} /> 浏览器通知
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={reminders.speechEnabled} onChange={() => toggleReminder('speechEnabled')} /> 语音提醒
            </label>
          </div>
          <div className="label" style={{ marginTop: 14 }}>
            <span>提醒间隔（分钟）</span>
            <input className="input" type="number" min={15} max={180} value={reminders.waterIntervalMinutes} onChange={(e) => { const next = { ...reminders, waterIntervalMinutes: Number(e.target.value) }; setReminders(next); saveReminders(next) }} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">今日记录</h2>
        <RecordList records={today.filter((r) => r.type === 'water')} onDelete={handleDelete} />
      </div>
    </motion.div>
  )
}

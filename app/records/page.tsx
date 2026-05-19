"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { HabitType, HealthRecord } from '@/lib/types'
import { RecordList } from '@/components/RecordList'
import { getRecords, deleteRecord, clearAllRecords } from '@/lib/storage'

const typeOptions: { value: HabitType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'posture', label: '体态' },
  { value: 'kegel', label: '提肛' },
  { value: 'eye-care', label: '护眼' },
  { value: 'water', label: '喝水' },
  { value: 'neck', label: '颈椎' }
]

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [filter, setFilter] = useState<HabitType | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    const update = () => setRecords(getRecords())
    update()
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [])

  const filtered = records.filter((r) => {
    if (filter !== 'all' && r.type !== filter) return false
    if (dateFilter && r.createdAt.slice(0, 10) !== dateFilter) return false
    return true
  })

  const handleDelete = (id: string) => {
    deleteRecord(id)
    setRecords(getRecords())
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">训练记录</h1>
          <p className="muted">共 {filtered.length} 条记录</p>
        </div>
        <button className="btn btn-danger" onClick={() => { if (confirm('确定清除全部记录？')) { clearAllRecords(); setRecords([]) } }}><Trash2 size={16} />清空全部</button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="tabs">
          {typeOptions.map((opt) => (
            <button key={opt.value} className={`tab ${filter === opt.value ? 'active' : ''}`} onClick={() => setFilter(opt.value)}>{opt.label}</button>
          ))}
        </div>
        <input className="input" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 180 }} />
      </div>

      <RecordList records={filtered} onDelete={handleDelete} />
    </motion.div>
  )
}

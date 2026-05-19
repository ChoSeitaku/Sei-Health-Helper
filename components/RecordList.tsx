"use client"

import { Trash2 } from 'lucide-react'
import type { HealthRecord } from '@/lib/types'

const typeLabel: Record<string, string> = { posture: '体态', kegel: '提肛', 'eye-care': '护眼', water: '喝水', neck: '颈椎' }

export function RecordList({ records, onDelete }: { records: HealthRecord[]; onDelete?: (id: string) => void }) {
  if (!records.length) {
    return <div className="card card-subtle"><p className="muted" style={{ margin: 0 }}>暂无记录，完成一次训练或喝水打卡后会显示在这里。</p></div>
  }

  return (
    <div className="table-list">
      {records.map((record) => (
        <article key={record.id} className="row-card">
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge">{typeLabel[record.type]}</span>
              <strong>{record.title}</strong>
            </div>
            <p className="muted" style={{ margin: '8px 0 0' }}>
              {new Date(record.createdAt).toLocaleString('zh-CN')}
              {record.durationSeconds ? ` · ${Math.round(record.durationSeconds / 60)} 分钟` : ''}
              {record.value ? ` · ${record.value}${record.unit ?? ''}` : ''}
              {typeof record.score === 'number' ? ` · 评分 ${record.score}` : ''}
            </p>
          </div>
          {onDelete ? <button className="btn btn-danger" onClick={() => onDelete(record.id)}><Trash2 size={16} />删除</button> : null}
        </article>
      ))}
    </div>
  )
}

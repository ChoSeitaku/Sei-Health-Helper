import type { LucideIcon } from 'lucide-react'

export function StatCard({ title, value, suffix, description, icon: Icon, tone = 'primary' }: { title: string; value: string | number; suffix?: string; description?: string; icon?: LucideIcon; tone?: 'primary' | 'blue' | 'warning' | 'danger' }) {
  const color = tone === 'blue' ? 'var(--secondary)' : tone === 'warning' ? 'var(--warning)' : tone === 'danger' ? 'var(--danger)' : 'var(--primary)'
  return (
    <div className="card card-subtle">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>{title}</p>
          <div className="stat-value" style={{ color }}>{value}<span style={{ fontSize: 16, marginLeft: 4 }}>{suffix}</span></div>
        </div>
        {Icon ? <span className="logo-mark" style={{ width: 40, height: 40, borderRadius: 14, background: color }}><Icon size={19} /></span> : null}
      </div>
      {description ? <p className="muted" style={{ margin: '10px 0 0', fontSize: 13 }}>{description}</p> : null}
    </div>
  )
}

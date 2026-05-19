"use client"

export function WaterCup({ current, goal }: { current: number; goal: number }) {
  const percent = Math.min(100, Math.round((current / Math.max(goal, 1)) * 100))

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <div className="water-cup" aria-label={`今日饮水 ${percent}%`}>
        <div className="water-fill" style={{ height: `${percent}%` }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="stat-value" style={{ color: 'var(--secondary)' }}>{current}<span style={{ fontSize: 16 }}>ml</span></div>
        <p className="muted" style={{ margin: 0 }}>目标 {goal}ml · {percent}%</p>
      </div>
    </div>
  )
}

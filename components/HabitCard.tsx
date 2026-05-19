import Link from 'next/link'
import { Activity, Droplets, Eye, Flower2, ScanLine } from 'lucide-react'
import type { Habit } from '@/lib/types'

const iconMap = { ScanLine, Activity, Eye, Droplets, Flower2 }
const hrefMap = { posture: '/posture', kegel: '/kegel', 'eye-care': '/eye-care', water: '/water', neck: '/neck' }

export function HabitCard({ habit, completed = 0 }: { habit: Habit; completed?: number }) {
  const Icon = iconMap[habit.icon as keyof typeof iconMap] ?? Activity
  const progress = Math.min(100, Math.round((completed / Math.max(habit.dailyGoal, 1)) * 100))

  return (
    <Link className="card" href={hrefMap[habit.type]} style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <span className="logo-mark" style={{ background: habit.color }}><Icon size={22} /></span>
        <span className="badge">{completed}/{habit.dailyGoal} {habit.unit}</span>
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px' }}>{habit.name}</h3>
        <p className="muted" style={{ margin: 0 }}>{habit.description}</p>
      </div>
      <div className="progress"><span style={{ width: `${progress}%`, background: habit.color }} /></div>
    </Link>
  )
}

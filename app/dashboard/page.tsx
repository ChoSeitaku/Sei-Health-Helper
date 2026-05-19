"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Activity, ArrowRight, Droplets, Eye, Flower2, ScanLine, TrendingUp, Zap } from 'lucide-react'
import type { HealthRecord } from '@/lib/types'
import { StatCard } from '@/components/StatCard'
import { HabitCard } from '@/components/HabitCard'
import { getHabits, getRecords } from '@/lib/storage'
import { getTodaySummary, getStreakDays, getTotalTrainingSeconds } from '@/lib/stats'
import { formatSeconds } from '@/lib/utils'

export default function DashboardPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  useEffect(() => {
    setRecords(getRecords())
    const onStorage = () => setRecords(getRecords())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const habits = getHabits()
  const summary = getTodaySummary(records)
  const streak = getStreakDays(records)
  const totalSeconds = getTotalTrainingSeconds(records)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 className="page-title">健康仪表盘</h1>
        <p className="muted">今日完成情况与历史概览。</p>
      </div>

      <div className="grid-3">
        <StatCard title="连续打卡" value={streak} suffix="天" icon={Zap} tone="warning" />
        <StatCard title="今日完成习惯" value={summary.completedHabits} suffix="/5" icon={TrendingUp} />
        <StatCard title="累计训练时长" value={formatSeconds(totalSeconds)} icon={Activity} tone="blue" />
      </div>

      <div>
        <h2 className="section-title">今日进度</h2>
        <div className="grid-4">
          <StatCard title="体态评分" value={summary.lastPostureScore} suffix="分" icon={ScanLine} tone={summary.lastPostureScore >= 80 ? 'primary' : summary.lastPostureScore >= 60 ? 'warning' : 'danger'} description="最近一次体态检测得分" />
          <StatCard title="饮水" value={summary.water} suffix="ml" icon={Droplets} tone="blue" description="今日已记录饮水量" />
          <StatCard title="护眼" value={summary.eyeCare} suffix="次" icon={Eye} description="今日护眼训练次数" />
          <StatCard title="颈椎/提肛" value={summary.neck + summary.kegel} suffix="次" icon={Flower2} description="颈椎放松和提肛训练" />
        </div>
      </div>

      <div>
        <h2 className="section-title">快速开始</h2>
        <div className="grid-2">
          {habits.filter((h) => h.enabled).slice(0, 4).map((habit) => {
            const completed = habit.type === 'water' ? summary.water : habit.type === 'posture' ? summary.posture : habit.type === 'eye-care' ? summary.eyeCare : habit.type === 'kegel' ? summary.kegel : summary.neck
            return <HabitCard key={habit.id} habit={habit} completed={completed} />
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link className="btn" href="/records">查看全部记录 <ArrowRight size={16} /></Link>
        </div>
      </div>
    </motion.div>
  )
}

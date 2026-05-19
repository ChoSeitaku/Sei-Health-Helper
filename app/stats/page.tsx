"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Droplets, Eye, Flower2, ScanLine, TrendingUp, Zap } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import type { HealthRecord } from '@/lib/types'
import { ChartCard } from '@/components/ChartCard'
import { StatCard } from '@/components/StatCard'
import { getRecords } from '@/lib/storage'
import { getStats } from '@/lib/stats'
import { formatSeconds } from '@/lib/utils'

const COLORS = ['#10b981', '#f59e0b', '#38bdf8', '#0ea5e9', '#22c55e']

export default function StatsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  useEffect(() => {
    setRecords(getRecords())
    const onStorage = () => setRecords(getRecords())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const stats = getStats(records)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 className="page-title">数据统计</h1>
        <p className="muted">基于本地记录的行为趋势分析。</p>
      </div>

      <div className="grid-4">
        <StatCard title="连续打卡" value={stats.streakDays} suffix="天" icon={Zap} tone="warning" />
        <StatCard title="总训练时长" value={formatSeconds(stats.totalTrainingSeconds)} icon={Activity} tone="blue" />
        <StatCard title="总饮水" value={stats.totalWater} suffix="ml" icon={Droplets} tone="blue" />
        <StatCard title="最常用" value={stats.mostUsedType} icon={TrendingUp} />
      </div>

      <ChartCard title="7 天趋势" description="每日习惯数量与体态评分变化。">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={stats.sevenDayTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,.12)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" name="习惯数" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="posture" name="体态评分" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid-2">
        <ChartCard title="每日饮水">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.sevenDayTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,.12)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="water" name="饮水 ml" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="习惯分布" description="各类型训练次数占比。">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} ${value}`}>
                {stats.distribution.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="30 天体态趋势">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={stats.thirtyDayTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,.12)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="posture" name="体态评分" stroke="#10b981" fill="rgba(16,185,129,.16)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </motion.div>
  )
}

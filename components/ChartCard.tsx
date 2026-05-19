"use client"

import { motion } from 'framer-motion'

export function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <motion.section className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {description ? <p className="muted" style={{ margin: '6px 0 0' }}>{description}</p> : null}
        </div>
      </div>
      {children}
    </motion.section>
  )
}

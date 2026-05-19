"use client"

import { motion } from 'framer-motion'

export function NeckExerciseAnimation({ mode = 'chin' }: { mode?: 'chin' | 'shoulder' | 'open' }) {
  return (
    <div className="neck-animation card-subtle" style={{ borderRadius: 28 }}>
      <motion.div animate={mode === 'chin' ? { x: [-4, 10, -4] } : mode === 'shoulder' ? { y: [0, -18, 0] } : { rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
        <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'linear-gradient(135deg, #bbf7d0, #7dd3fc)' }} />
        <div style={{ width: 128, height: 92, borderRadius: '42px 42px 18px 18px', background: 'linear-gradient(135deg, #10b981, #38bdf8)' }} />
      </motion.div>
    </div>
  )
}

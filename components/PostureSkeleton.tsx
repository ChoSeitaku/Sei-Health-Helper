"use client"

import { motion } from 'framer-motion'

export function PostureSkeleton({ active = true }: { active?: boolean }) {
  return (
    <div className="skeleton-card card-subtle" style={{ borderRadius: 28 }}>
      <motion.svg width="220" height="260" viewBox="0 0 220 260" animate={active ? { y: [0, -6, 0] } : {}} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}>
        <defs>
          <linearGradient id="skeletonGradient" x1="0" x2="1"><stop stopColor="#10b981" /><stop offset="1" stopColor="#38bdf8" /></linearGradient>
        </defs>
        <circle cx="110" cy="38" r="24" fill="url(#skeletonGradient)" opacity=".9" />
        <path d="M110 64 L110 132 M70 88 L150 88 M82 92 L62 138 M138 92 L158 138 M110 132 L78 206 M110 132 L142 206" stroke="url(#skeletonGradient)" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M84 206 L72 236 M136 206 L148 236" stroke="#86efac" strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="62" cy="138" r="8" fill="#f59e0b" /><circle cx="158" cy="138" r="8" fill="#f59e0b" />
      </motion.svg>
    </div>
  )
}

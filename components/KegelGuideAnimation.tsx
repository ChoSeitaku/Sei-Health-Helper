"use client"

import { BreathingCircle } from './BreathingCircle'

export function KegelGuideAnimation({ phase = 'hold' }: { phase?: 'contract' | 'relax' | 'hold' }) {
  return (
    <div className="kegel-animation card-subtle" style={{ borderRadius: 28 }}>
      <BreathingCircle phase={phase} label={phase === 'contract' ? '轻收' : phase === 'relax' ? '完全放松' : '稳定'} />
    </div>
  )
}

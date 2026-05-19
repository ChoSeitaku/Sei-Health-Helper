"use client"

export function BreathingCircle({ phase = 'hold', label }: { phase?: 'contract' | 'relax' | 'hold'; label?: string }) {
  return (
    <div className={`breathing-circle ${phase}`}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 900 }}>{label ?? (phase === 'contract' ? '收紧' : phase === 'relax' ? '放松' : '保持')}</div>
        <div style={{ marginTop: 6, opacity: .86 }}>自然呼吸</div>
      </div>
    </div>
  )
}

"use client"

export function EyeExerciseAnimation({ mode = 'move' }: { mode?: 'move' | 'blink' | 'close' }) {
  return (
    <div className="eye-animation card-subtle" style={{ borderRadius: 28 }}>
      <div className="eye-ball" style={{ transform: mode === 'close' ? 'scaleY(.16)' : 'none', transition: '.35s ease' }}>
        {mode !== 'close' ? <div className="eye-pupil" style={{ animationDuration: mode === 'blink' ? '1.2s' : '4s' }} /> : null}
      </div>
    </div>
  )
}

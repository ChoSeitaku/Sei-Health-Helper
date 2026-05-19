"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import type { TrainingAction, TrainingCourse } from '@/lib/types'
import { speak, stopSpeaking } from '@/lib/speech'
import { getSettings } from '@/lib/storage'

type Phase = { action: TrainingAction; kind: 'action' | 'rest'; seconds: number; actionIndex: number; label: string }

function buildPhases(course: TrainingCourse): Phase[] {
  const phases: Phase[] = []
  course.actions.forEach((action, idx) => {
    for (let i = 0; i < action.repeat; i++) {
      phases.push({ action, kind: 'action', seconds: action.durationSeconds, actionIndex: idx, label: action.name })
      if (action.restSeconds > 0) phases.push({ action, kind: 'rest', seconds: action.restSeconds, actionIndex: idx, label: `${action.name} · 休息` })
    }
  })
  return phases
}

export function TrainingTimer({ course, onComplete, onTick }: { course: TrainingCourse; onComplete?: (totalSeconds: number) => void; onTick?: (phase: Phase, remaining: number) => void }) {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const phasesRef = useRef<Phase[]>(buildPhases(course))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const settings = typeof window !== 'undefined' ? getSettings() : null

  const phases = phasesRef.current
  const total = phases.reduce((sum, p) => sum + p.seconds, 0)
  const progress = total > 0 ? Math.round(((total - phases.slice(0, phaseIdx).reduce((sum, p) => sum + p.seconds, 0) - secondsLeft) / total) * 100) : 0
  const currentPhase = phases[phaseIdx]

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setPhaseIdx((idx) => {
          if (idx >= phasesRef.current.length - 1) {
            setRunning(false)
            setPaused(false)
            setElapsed((e) => e + 1)
            return idx
          }
          const next = idx + 1
          const nextPhase = phasesRef.current[next]
          if (nextPhase.kind === 'action' && settings?.speechEnabled) {
            speak(nextPhase.action.voiceText, { rate: settings.speechRate ?? 1, volume: settings.speechVolume ?? 0.9 })
          }
          return next
        })
        return 0
      }
      return prev - 1
    })
    setElapsed((e) => e + 1)
  }, [settings])

  useEffect(() => {
    if (phases.length > 0 && secondsLeft === 0 && phaseIdx === 0 && !running) {
      setSecondsLeft(phases[0].seconds)
    }
  }, [phases, running, phaseIdx, secondsLeft])

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [running, paused, tick, clearTimer])

  useEffect(() => {
    if (currentPhase) onTick?.(currentPhase, secondsLeft)
  }, [currentPhase, secondsLeft, onTick])

  useEffect(() => {
    if (!running && elapsed > 0 && phaseIdx >= phases.length - 1) {
      stopSpeaking()
      onComplete?.(elapsed)
    }
  }, [running, elapsed, phaseIdx, phases.length, onComplete])

  const start = () => {
    if (phases.length === 0) return
    if (secondsLeft === 0) setSecondsLeft(phases[phaseIdx].seconds)
    setRunning(true)
    setPaused(false)
  }
  const pause = () => { setPaused(true); stopSpeaking() }
  const resume = () => setPaused(false)
  const stop = () => {
    clearTimer()
    setRunning(false)
    setPaused(false)
    setPhaseIdx(0)
    setSecondsLeft(phases[0]?.seconds ?? 0)
    setElapsed(0)
    stopSpeaking()
  }

  if (!currentPhase) {
    return <div className="card"><p className="muted" style={{ margin: 0 }}>课程暂无可执行动作。</p></div>
  }

  return (
    <div className="card" style={{ textAlign: 'center', display: 'grid', gap: 24 }}>
      <div className="progress"><span style={{ width: `${progress}%`, transition: 'width .35s ease' }} /></div>
      <div>
        <div className="stat-value" style={{ fontSize: 44, color: 'var(--primary)' }}>{secondsLeft}<span className="muted" style={{ fontSize: 18 }}>s</span></div>
        <p style={{ margin: '8px 0 0', fontWeight: 700 }}>{currentPhase.label}</p>
        <p className="muted" style={{ margin: 0 }}>{currentPhase.kind === 'action' ? currentPhase.action.instruction : '放松休息，保持自然呼吸。'}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!running || paused ? (
          <button className="btn btn-primary" onClick={paused ? resume : start}><Play size={18} />{paused ? '继续' : '开始训练'}</button>
        ) : (
          <button className="btn" onClick={pause}><Pause size={18} />暂停</button>
        )}
        <button className="btn btn-ghost" onClick={stop}><Square size={18} />停止</button>
        <button className="btn btn-ghost" onClick={() => { stop(); setTimeout(start, 50) }}><RotateCcw size={18} />重新开始</button>
      </div>
    </div>
  )
}

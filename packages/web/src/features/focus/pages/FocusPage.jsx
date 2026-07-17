import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@pulse/shared/config'
import { useAuth } from '@pulse/shared/context'
import Button from '../../../shared/components/Button'
import { useToast } from '../../../shared/components/Toast'

const RING_SIZE = 320
const RING_STROKE = 10

function AmbientParticles() {
  // Slow-rising glow specks around the timer while a session runs.
  const specks = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${8 + ((i * 83) % 84)}%`,
    delay: (i * 0.9) % 6,
    size: 3 + (i % 3) * 2,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {specks.map((s) => (
        <motion.span
          key={s.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: [0, 0.7, 0], y: -280 }}
          transition={{ duration: 7, repeat: Infinity, delay: s.delay, ease: 'linear' }}
          className="absolute bottom-0 rounded-full bg-accent"
          style={{ left: s.left, width: s.size, height: s.size, filter: 'blur(1px)', boxShadow: '0 0 12px rgba(255,122,217,0.8)' }}
        />
      ))}
    </div>
  )
}

function TimerRing({ progress, isBreak, paused, running, children }) {
  const r = RING_SIZE / 2 - RING_STROKE - 4
  const c = 2 * Math.PI * r
  const from = isBreak ? '#64b6ac' : '#8b5cf6'
  const to = isBreak ? '#7cc7bf' : '#a78bfa'
  return (
    <motion.div
      animate={running ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 3.4, repeat: running ? Infinity : 0, ease: 'easeInOut' }}
      className={`relative transition-opacity duration-300 ${paused ? 'opacity-60' : ''}`}
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        filter: `drop-shadow(0 0 ${running ? 44 : 24}px ${from}44)`,
      }}
    >
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <defs>
          <linearGradient id="focus-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          fill="transparent"
          stroke="url(#focus-ring-grad)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </motion.div>
  )
}

export default function FocusPage() {
  const { user } = useAuth()
  const showToast = useToast()
  const [workMin, setWorkMin] = useState(25)
  const [breakMin, setBreakMin] = useState(5)
  const [mode, setMode] = useState('work')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const intervalRef = useRef(null)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const totalSeconds = (mode === 'work' ? workMin : breakMin) * 60

  useEffect(() => {
    if (!running) return undefined
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1
        // Session complete — log it, flip mode, keep cycling.
        const finishedMode = modeRef.current
        const nextMode = finishedMode === 'work' ? 'break' : 'work'
        const duration = finishedMode === 'work' ? workMin : breakMin
        if (user) {
          addDoc(collection(db, 'users', user.uid, 'focusSessions'), {
            startedAt: serverTimestamp(),
            durationMinutes: duration,
            type: finishedMode,
            completed: true,
          }).catch((err) => console.warn('Could not log focus session:', err?.code || err))
        }
        if (finishedMode === 'work') setSessionsToday((n) => n + 1)
        showToast(
          finishedMode === 'work' ? 'Work session complete! Take a break. 🎉' : 'Break over — back to focus. 💪',
          finishedMode === 'work' ? 'success' : 'info',
        )
        setMode(nextMode)
        return (nextMode === 'work' ? workMin : breakMin) * 60
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, workMin, breakMin, user, showToast])

  const start = () => { setRunning(true); setStarted(true) }
  const pause = () => setRunning(false)
  const reset = () => {
    setRunning(false)
    setStarted(false)
    setMode('work')
    setSecondsLeft(workMin * 60)
  }

  const changeDuration = (setter, value, isWork) => {
    const v = Number(value)
    setter(v)
    if (!started && ((isWork && mode === 'work') || (!isWork && mode === 'break'))) {
      setSecondsLeft(v * 60)
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const progress = totalSeconds === 0 ? 0 : 1 - secondsLeft / totalSeconds

  return (
    <div className="hero-spot relative mx-auto flex max-w-[600px] flex-col items-center" style={{ '--accent': '#8b5cf6' }}>
      {running && <AmbientParticles />}

      <p className="label-caps mb-2">Deep work, beautifully timed</p>
      <h1 className="mb-2 font-display text-4xl font-bold tracking-[0.02em]">
        Focus <span className="text-gradient">Timer</span>
      </h1>
      <p className="mb-8 text-sm text-text-tertiary">
        {sessionsToday > 0 ? `${sessionsToday} work session${sessionsToday === 1 ? '' : 's'} completed this sitting` : 'Pomodoro-style focus sessions'}
      </p>

      <AnimatePresence mode="wait">
        <motion.span
          key={mode}
          initial={{ opacity: 0, y: -8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          className={`mb-8 rounded-full border px-6 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] ${
            mode === 'work'
              ? 'border-primary/30 bg-primary/10 text-primary-light'
              : 'border-secondary/30 bg-secondary/10 text-secondary'
          }`}
        >
          {mode === 'work' ? '● Focus' : '○ Break'}
        </motion.span>
      </AnimatePresence>

      <TimerRing progress={progress} isBreak={mode === 'break'} paused={started && !running} running={running}>
        <span className="font-brand-mono text-[84px] font-bold leading-none tabular-nums tracking-[-0.03em]">
          {mm}:{ss}
        </span>
        <span className="mt-3 text-xs text-text-subtle">
          {running ? 'stay in the zone' : started ? 'paused' : 'ready when you are'}
        </span>
      </TimerRing>

      <div className="mt-10 flex gap-3">
        {!running ? (
          <Button size="lg" onClick={start}>{started ? '▶ Resume' : '▶ Start'}</Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={pause}>⏸ Pause</Button>
        )}
        <Button size="lg" variant="ghost" onClick={reset}>Reset</Button>
      </div>

      <div className="card-glass mt-12 w-full p-7">
        <div className="mb-6">
          <div className="mb-2.5 flex justify-between text-sm">
            <span className="font-display font-semibold">Work duration</span>
            <span className="font-brand-mono text-primary-light">{workMin} min</span>
          </div>
          <input
            type="range" min="5" max="90" step="5" value={workMin}
            onChange={(e) => changeDuration(setWorkMin, e.target.value, true)}
            disabled={started}
            className="w-full disabled:opacity-40"
            style={{ accentColor: '#8b5cf6' }}
          />
        </div>
        <div>
          <div className="mb-2.5 flex justify-between text-sm">
            <span className="font-display font-semibold">Break duration</span>
            <span className="font-brand-mono text-secondary">{breakMin} min</span>
          </div>
          <input
            type="range" min="1" max="30" value={breakMin}
            onChange={(e) => changeDuration(setBreakMin, e.target.value, false)}
            disabled={started}
            className="w-full disabled:opacity-40"
            style={{ accentColor: '#64b6ac' }}
          />
        </div>
        {started && <p className="mt-4 text-center text-xs text-text-subtle">Reset the timer to change durations</p>}
      </div>
    </div>
  )
}

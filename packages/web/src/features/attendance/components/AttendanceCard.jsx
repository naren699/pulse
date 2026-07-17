import { useEffect, useRef, useState } from 'react'
import { attendanceStatus, classesRemaining } from '@pulse/shared/services'
import ProgressRing from '../../../shared/components/ProgressRing'
import { StatusBadge } from '../../../shared/components/Badge'

const STATUS_TEXT_COLOR = {
  success: 'text-emerald-300',
  warning: 'text-amber-300',
  danger: 'text-red-300',
  info: 'text-text-tertiary',
}

function remainingText(remaining) {
  if (remaining.type === 'none') return null
  if (remaining.type === 'canSkip') {
    return remaining.count === 0
      ? "You're right on target — don't miss the next one"
      : `You can skip ${remaining.count} more class${remaining.count === 1 ? '' : 'es'} and stay on track`
  }
  return `Attend the next ${remaining.count} class${remaining.count === 1 ? '' : 'es'} to get back on track`
}

function SubjectMenu({ subject, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg px-2 py-1 text-lg leading-none text-text-tertiary transition-colors hover:bg-slate-200/10 hover:text-text-primary"
        aria-label={`Options for ${subject.name}`}
        aria-expanded={open}
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200/15 bg-bg-secondary shadow-2xl">
          <button
            onClick={() => { setOpen(false); onEdit(subject) }}
            className="block w-full px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-slate-200/10 hover:text-text-primary"
          >
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(subject) }}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-300 hover:bg-danger/15"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function AttendanceCard({ subject, stats, onMarkPresent, onMarkAbsent, onEdit, onDelete }) {
  const { status, statusText } = attendanceStatus(stats.percentage, subject.targetPercent, stats.totalSessions)
  const remaining = classesRemaining(stats.presentCount, stats.totalSessions, subject.targetPercent)
  const remainingMsg = remainingText(remaining)

  return (
    <div
      className="card-glass relative p-6 transition-all hover:scale-[1.02] hover:border-primary/25 hover:shadow-[0_20px_48px_rgba(99,102,241,0.12)]"
      style={{ borderLeft: `4px solid ${subject.colorAccent || '#6366F1'}` }}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">{subject.name}</h3>
          <p className="font-brand-mono text-xs text-text-subtle">
            Attendance: {stats.presentCount}/{stats.totalSessions}
          </p>
        </div>
        <SubjectMenu subject={subject} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="flex items-center gap-5">
        <ProgressRing percent={stats.percentage} size="md" from="#8b5cf6" to="#a78bfa" />
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${STATUS_TEXT_COLOR[status]}`}>
            {Math.round(stats.percentage)}% / Target {subject.targetPercent}%{' '}
            {status === 'success' ? '✓' : status === 'info' ? '' : '⚠'}
          </p>
          <StatusBadge status={status} className="mt-2">
            {statusText}
          </StatusBadge>
        </div>
      </div>

      {remainingMsg && (
        <p className={`mt-3 text-xs font-medium ${remaining.type === 'canSkip' ? 'text-emerald-300/90' : 'text-amber-300/90'}`}>
          {remaining.type === 'canSkip' ? '🎯 ' : '⏳ '}{remainingMsg}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onMarkPresent(subject)}
          className="flex-1 rounded-xl border border-white/15 bg-gradient-to-r from-blue to-cyan px-4 py-2.5 font-display text-sm font-semibold text-white shadow-[0_10px_32px_-8px_rgba(59,130,246,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-8px_rgba(34,211,238,0.65)] active:scale-[0.98]"
        >
          ✓ Present
        </button>
        <button
          onClick={() => onMarkAbsent(subject)}
          className="flex-1 rounded-xl border border-danger/30 bg-danger/15 px-4 py-2.5 font-display text-sm font-semibold text-danger/80 transition-colors duration-200 hover:bg-danger/25 active:scale-[0.98]"
        >
          ✗ Absent
        </button>
      </div>
    </div>
  )
}

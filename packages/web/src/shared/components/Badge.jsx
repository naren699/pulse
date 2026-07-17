const STATUS_STYLES = {
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  danger: 'bg-danger/10 text-danger/80 border-danger/25',
  info: 'bg-primary/10 text-primary-light border-primary/25',
  streak: 'bg-primary/10 text-primary-light border-primary/25',
}

export function StatusBadge({ status = 'info', icon, children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5',
        'text-xs font-medium tracking-[0.04em]',
        STATUS_STYLES[status] || STATUS_STYLES.info,
        className,
      ].join(' ')}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}

export function TagBadge({ children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04]',
        'px-3 py-1 text-[11px] font-medium text-text-secondary backdrop-blur-md',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export function CounterBadge({ count, className = '' }) {
  if (!count) return null
  return (
    <span
      className={[
        'flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1',
        'font-display text-[10px] font-bold text-white',
        className,
      ].join(' ')}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

// Semantic difficulty tints — data-critical, so they keep their hue, muted.
const DIFFICULTY_STYLES = {
  Easy: 'bg-success/10 text-success border-success/25',
  Medium: 'bg-warning/10 text-warning border-warning/25',
  Hard: 'bg-danger/10 text-danger/80 border-danger/25',
}

export function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-4 py-1.5',
        'font-display text-xs font-semibold tracking-[0.04em]',
        DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.Easy,
      ].join(' ')}
    >
      {difficulty}
    </span>
  )
}

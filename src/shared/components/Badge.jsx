const STATUS_STYLES = {
  success: 'bg-success/[0.12] text-[#7df0c8] border-success/30 shadow-[0_0_20px_-6px_rgba(0,226,154,0.4)]',
  warning: 'bg-warning/[0.12] text-[#ffdf9e] border-warning/30 shadow-[0_0_20px_-6px_rgba(255,200,87,0.35)]',
  danger: 'bg-danger/[0.12] text-[#ff9fb0] border-danger/30 shadow-[0_0_20px_-6px_rgba(255,94,120,0.4)]',
  info: 'bg-primary/[0.12] text-[#bdb2ff] border-primary/30 shadow-[0_0_20px_-6px_rgba(124,108,255,0.4)]',
  streak:
    'bg-gradient-to-r from-accent/[0.14] to-orange/[0.14] text-[#ffb3e6] border-accent/30 shadow-[0_0_20px_-6px_rgba(255,122,217,0.45)]',
}

export function StatusBadge({ status = 'info', icon, children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5',
        'font-display text-xs font-semibold tracking-[0.04em]',
        'transition-transform duration-150 hover:scale-105',
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
        'flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-danger to-accent px-1',
        'font-brand-mono text-[10px] font-bold text-white shadow-[0_0_12px_rgba(255,94,120,0.5)]',
        className,
      ].join(' ')}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

const DIFFICULTY_GRADIENT = {
  Easy: 'from-success/80 to-cyan/70 shadow-[0_4px_20px_-4px_rgba(0,226,154,0.5)]',
  Medium: 'from-warning/80 to-orange/80 shadow-[0_4px_20px_-4px_rgba(255,200,87,0.5)]',
  Hard: 'from-danger/80 to-accent/80 shadow-[0_4px_20px_-4px_rgba(255,94,120,0.5)]',
}

export function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full bg-gradient-to-r px-4 py-1.5',
        'font-display text-xs font-bold tracking-[0.04em] text-white',
        DIFFICULTY_GRADIENT[difficulty] || DIFFICULTY_GRADIENT.Easy,
      ].join(' ')}
    >
      {difficulty}
    </span>
  )
}

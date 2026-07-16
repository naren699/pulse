const SIZES = {
  xl: { d: 200, stroke: 8, text: 'text-5xl' },
  lg: { d: 120, stroke: 6, text: 'text-[30px]' },
  md: { d: 96, stroke: 5, text: 'text-2xl' },
  sm: { d: 60, stroke: 4, text: 'text-base' },
}

let gradientCounter = 0

export default function ProgressRing({ percent = 0, size = 'md', label, glow = true, from = '#7c6cff', to = '#a855f7' }) {
  const { d, stroke, text } = SIZES[size] || SIZES.md
  const r = d / 2 - stroke - 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = c - (clamped / 100) * c
  // Stable-enough unique id so multiple rings on a page don't collide.
  const gid = `ring-grad-${(gradientCounter = (gradientCounter + 1) % 1e6)}`

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      style={{ width: d, height: d, filter: glow ? `drop-shadow(0 0 ${Math.round(d / 8)}px ${from}55)` : undefined }}
    >
      <svg width={d} height={d} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={d / 2} cy={d / 2} r={r} fill="transparent" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={d / 2}
          cy={d / 2}
          r={r}
          fill="transparent"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-brand-mono font-bold tabular-nums text-text-primary ${text}`}>{Math.round(clamped)}%</span>
        {label && <span className="mt-0.5 text-xs text-text-tertiary">{label}</span>}
      </div>
    </div>
  )
}

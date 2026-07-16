const CONFIG = {
  Easy: { color: 'text-emerald-300', dot: 'bg-emerald-400' },
  Medium: { color: 'text-amber-300', dot: 'bg-amber-400' },
  Hard: { color: 'text-red-300', dot: 'bg-red-400' },
}

export default function DifficultyBreakdown({ counts }) {
  return (
    <div className="mx-auto flex max-w-[600px] items-center justify-center gap-6 rounded-xl border border-slate-200/10 bg-surface/40 px-6 py-4">
      {Object.entries(counts).map(([difficulty, count]) => (
        <div key={difficulty} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${CONFIG[difficulty].dot}`} />
          <span className={`font-brand-mono text-lg font-bold ${CONFIG[difficulty].color}`}>{count}</span>
          <span className="text-xs text-text-tertiary">{difficulty}</span>
        </div>
      ))}
    </div>
  )
}

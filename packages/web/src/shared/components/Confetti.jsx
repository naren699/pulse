const COLORS = ['#8b5cf6', '#a78bfa', '#7c3aed', '#64b6ac', '#c4b5fd']

// Lightweight CSS confetti burst. Mount it (e.g. keyed by a counter) to play.
export default function Confetti({ count = 28 }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0 overflow-visible">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-confetti-fall"
          style={{
            left: `${(i * 97) % 100}%`,
            width: 6 + (i % 3) * 2,
            height: 8 + (i % 4) * 2,
            background: COLORS[i % COLORS.length],
            borderRadius: i % 2 ? '50%' : '2px',
            animationDelay: `${(i % 7) * 0.06}s`,
          }}
        />
      ))}
    </div>
  )
}

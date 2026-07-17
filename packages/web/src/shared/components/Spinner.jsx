export default function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function PageSpinner({ label = 'Loading…' }) {
  // Subtle pulse instead of a spinning loader.
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <span className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse-dot rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
      <p className="text-sm text-text-tertiary">{label}</p>
    </div>
  )
}

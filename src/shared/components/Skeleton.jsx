export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-white/[0.05] bg-[linear-gradient(100deg,transparent_25%,rgba(255,255,255,0.08)_50%,transparent_75%)] bg-[length:400px_100%] ${className}`}
    />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card-glass p-6">
      <Skeleton className="mb-4 h-5 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`mb-3 h-4 ${i % 2 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

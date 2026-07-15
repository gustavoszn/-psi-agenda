export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'var(--bg-hover)' }} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-token bg-surface">
      <Skeleton className="h-10 w-10 rounded-xl mb-4" />
      <Skeleton className="h-7 w-14 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-token bg-surface">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

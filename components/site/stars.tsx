/** Read-only star rating, e.g. ★★★★☆. */
export function Stars({ rating, className = 'size-4' }: { rating: number; className?: string }) {
  const value = Math.round(rating * 2) / 2
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1).replace('.0', '')} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0
        return (
          <svg key={i} viewBox="0 0 20 20" className={className} aria-hidden="true">
            <defs>
              <linearGradient id={`star-${i}-${fill}`}>
                <stop offset={`${fill * 100}%`} stopColor="#d69c55" />
                <stop offset={`${fill * 100}%`} stopColor="#d9d0bf" />
              </linearGradient>
            </defs>
            <path fill={`url(#star-${i}-${fill})`} d="M10 1.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L10 15l-5.3 2.8 1.1-5.9L1.4 7.8l6-.8z" />
          </svg>
        )
      })}
    </span>
  )
}

/** "Mona Ahmed" -> "Mona A." so full names never appear publicly. */
export function reviewerName(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0]
}

export function averageRating(reviews: { rating?: number | null }[]) {
  const rated = reviews.filter((r) => typeof r.rating === 'number') as { rating: number }[]
  if (!rated.length) return null
  return { average: rated.reduce((s, r) => s + r.rating, 0) / rated.length, count: rated.length }
}

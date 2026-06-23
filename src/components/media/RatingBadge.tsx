import { Star } from 'lucide-react'

import { MetadataPill } from './MetadataPill'

export function RatingBadge({ rating }: { rating: number | null | undefined }) {
  if (typeof rating !== 'number') {
    return <MetadataPill>Rating unavailable</MetadataPill>
  }

  return (
    <MetadataPill className="border-[rgba(255,222,164,0.22)] bg-[rgba(255,222,164,0.1)] text-white">
      <Star aria-hidden="true" className="size-3.5 fill-current text-[color:var(--color-warning)]" />
      {rating.toFixed(1)}
    </MetadataPill>
  )
}

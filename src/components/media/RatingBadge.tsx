import { Star } from 'lucide-react'

import { MetadataPill } from './MetadataPill'

export function RatingBadge({ rating }: { rating: number | null | undefined }) {
  if (typeof rating !== 'number') {
    return <MetadataPill>Rating unavailable</MetadataPill>
  }

  return (
    <MetadataPill className="border-[rgba(111,209,168,0.22)] bg-[rgba(111,209,168,0.1)] text-white">
      <Star aria-hidden="true" className="size-3.5 fill-current text-[color:var(--color-highlight)]" />
      {rating.toFixed(1)}
    </MetadataPill>
  )
}

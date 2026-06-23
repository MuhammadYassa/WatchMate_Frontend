import { Star } from 'lucide-react'

import type { ReviewResponseDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'
import { Card } from '../ui/Card'

function getInitial(username: string) {
  return username.charAt(0).toUpperCase()
}

export function ReviewCard({ review }: { review: ReviewResponseDTO }) {
  return (
    <Card className="space-y-4 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-[rgba(216,226,255,0.12)] text-sm font-semibold text-[color:var(--color-accent)]">
            {getInitial(review.username)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{review.username}</p>
            <p className="text-xs text-[color:var(--color-text-tertiary)]">
              {formatDisplayDate(review.updatedAt || review.postedAt)}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,222,164,0.22)] bg-[rgba(255,222,164,0.1)] px-3 py-2 text-xs font-semibold text-white">
          <Star aria-hidden="true" className="size-3.5 fill-current text-[color:var(--color-warning)]" />
          {review.starRating.toFixed(1)}
        </div>
      </div>
      <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">{review.comment}</p>
    </Card>
  )
}

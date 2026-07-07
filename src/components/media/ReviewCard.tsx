import { Star } from 'lucide-react'

import type { ReviewResponseDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'

function getInitial(username: string) {
  return username.charAt(0).toUpperCase()
}

export function ReviewCard({ review }: { review: ReviewResponseDTO }) {
  return (
    <div className="space-y-3.5 rounded-[var(--radius-panel)] border border-white/[0.07] bg-[color:var(--color-surface-1)] p-4 sm:space-y-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-white/[0.08] bg-[rgba(47,174,126,0.07)] text-sm font-semibold text-[color:var(--color-accent)]">
            {getInitial(review.username)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white [overflow-wrap:anywhere]">{review.username}</p>
            <p className="text-xs text-[color:var(--color-text-tertiary)]">
              {formatDisplayDate(review.updatedAt || review.postedAt)}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(111,209,168,0.2)] bg-[rgba(111,209,168,0.08)] px-3 py-1.5 text-xs font-semibold text-white">
          <Star aria-hidden="true" className="size-3.5 fill-current text-[color:var(--color-highlight)]" />
          {review.starRating.toFixed(1)}
        </div>
      </div>
      <p className="break-words text-sm leading-7 text-[color:var(--color-text-secondary)]">{review.comment}</p>
    </div>
  )
}

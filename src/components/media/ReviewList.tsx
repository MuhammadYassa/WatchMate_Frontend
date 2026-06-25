import { MessageSquare } from 'lucide-react'

import type { ReviewResponseDTO } from '../../types/api'
import { formatReviewCount } from '../../utils/labels'
import { EmptyState } from '../feedback/EmptyState'
import { SectionHeader } from '../layout/SectionHeader'
import { ReviewCard } from './ReviewCard'

export function ReviewList({ reviews }: { reviews: ReviewResponseDTO[] }) {
  return (
    <section className="space-y-5">
      <SectionHeader eyebrow="Reviews" title={formatReviewCount(reviews.length)} />
      {reviews.length > 0 ? (
        <div className="grid gap-4 2xl:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.reviewId} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState
          body="No one has posted a review here yet."
          heading="No reviews yet"
          icon={<MessageSquare aria-hidden="true" className="size-5" />}
        />
      )}
    </section>
  )
}

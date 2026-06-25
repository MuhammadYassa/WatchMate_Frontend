import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { reviewApi } from '../../api/reviewApi'
import type { ReviewResponseDTO } from '../../types/api'
import type { MediaType } from '../../types/enums'
import { ApiClientError } from '../../types/errors'
import { useToast } from '../feedback/toastContext'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormField } from '../ui/FormField'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

interface ReviewEditorCardProps {
  detailQueryKey: readonly unknown[]
  existingReview: ReviewResponseDTO | null
  mediaType: MediaType
  reviewQueryKey: readonly unknown[]
  tmdbId: number
}

export function ReviewEditorCard({
  detailQueryKey,
  existingReview,
  mediaType,
  reviewQueryKey,
  tmdbId,
}: ReviewEditorCardProps) {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [starRating, setStarRating] = useState(existingReview?.starRating ?? 4)

  async function invalidateReviewData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: detailQueryKey }),
      queryClient.invalidateQueries({ queryKey: reviewQueryKey }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: async () => {
      pushToast('Review saved.', 'success')
      await invalidateReviewData()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: { comment: string; reviewId: number; starRating: number }) =>
      reviewApi.updateReview(input.reviewId, {
        comment: input.comment,
        starRating: input.starRating,
      }),
    onSuccess: async () => {
      pushToast('Review updated.', 'success')
      await invalidateReviewData()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: reviewApi.deleteReview,
    onSuccess: async () => {
      pushToast('Review deleted.', 'success')
      await invalidateReviewData()
    },
  })

  const pending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const error = [createMutation.error, updateMutation.error, deleteMutation.error].find(
    (value) => value instanceof ApiClientError,
  )

  return (
    <Card className="space-y-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(173,198,255,0.22)_50%,rgba(255,255,255,0)_100%)]" />
      <div className="space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Your review
        </p>
        <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
          {existingReview ? 'Update your take.' : 'Share your take.'}
        </h2>
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          Keep it short and useful for your future self.
        </p>
      </div>

      <div className="grid gap-4">
        <FormField label="Rating">
          <Select
            className="bg-[rgba(10,12,16,0.8)]"
            disabled={pending}
            onChange={(event) => setStarRating(Number(event.target.value))}
            value={starRating}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          error={error instanceof ApiClientError ? error.message : null}
          hint="Reviews on this page stay tied to this title only."
          label="Comment"
        >
          <Textarea
            className="min-h-36 bg-[rgba(10,12,16,0.8)]"
            disabled={pending}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What stood out to you?"
            value={comment}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={pending || comment.trim().length < 4}
          onClick={() => {
            if (existingReview) {
              updateMutation.mutate({
                comment: comment.trim(),
                reviewId: existingReview.reviewId,
                starRating,
              })
              return
            }

            createMutation.mutate({
              comment: comment.trim(),
              starRating,
              tmdbId,
              type: mediaType,
            })
          }}
        >
          {existingReview ? 'Save changes' : 'Post review'}
        </Button>

        {existingReview ? (
          <Button
            disabled={pending}
            onClick={() => {
              deleteMutation.mutate(existingReview.reviewId)
            }}
            variant="ghost"
          >
            <Trash2 aria-hidden="true" className="mr-2 size-4" />
            Delete review
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

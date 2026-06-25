import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MessageSquareMore, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { favouriteApi } from '../api/favouriteApi'
import { movieApi } from '../api/movieApi'
import { reviewApi } from '../api/reviewApi'
import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster, SkeletonText } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { ActionPrompt } from '../components/media/ActionPrompt'
import { DetailHero } from '../components/media/DetailHero'
import { GenrePill } from '../components/media/GenrePill'
import { MediaActionsPanel } from '../components/media/MediaActionsPanel'
import { MetadataPill } from '../components/media/MetadataPill'
import { RatingBadge } from '../components/media/RatingBadge'
import { ReviewEditorCard } from '../components/media/ReviewEditorCard'
import { ReviewList } from '../components/media/ReviewList'
import { WatchlistDialog } from '../components/media/WatchlistDialog'
import { FavouriteStatusBadge, WatchStatusBadge } from '../components/media/StatusBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { ReviewResponseDTO } from '../types/api'
import type { WatchStatus } from '../types/enums'
import { formatDisplayDate, formatDisplayYear } from '../utils/dates'
import { formatMediaType } from '../utils/labels'

const REVIEWS_PAGE_SIZE = 20

function MovieDetailLoadingState() {
  return (
    <div className="relative isolate overflow-hidden pb-28">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0e11]">
        <BrowsePageAtmosphere variant="hero" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
          <div className="grid items-end gap-8 lg:min-h-[38rem] lg:grid-cols-[292px_minmax(0,1fr)] xl:grid-cols-[336px_minmax(0,1fr)]">
            <SkeletonPoster />
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-28 rounded-[14px]" />
                <Skeleton className="h-9 w-24 rounded-[14px]" />
              </div>
              <Skeleton className="h-20 w-full max-w-3xl rounded-[20px]" />
              <SkeletonText />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-28 rounded-[14px]" />
                <Skeleton className="h-10 w-28 rounded-[14px]" />
                <Skeleton className="h-10 w-28 rounded-[14px]" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <PageContainer className="relative z-10 -mt-10 space-y-6 pt-0 md:-mt-14">
        <Skeleton className="h-56 rounded-[24px]" />
        <Skeleton className="h-72 rounded-[24px]" />
      </PageContainer>
    </div>
  )
}

export function MovieDetailPage() {
  const { tmdbId } = useParams()
  const parsedTmdbId = Number(tmdbId)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const username = useAuthStore((state) => state.username)
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const movieQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId),
    queryFn: () => movieApi.getMovieDetails(parsedTmdbId),
    queryKey: ['movie-details', parsedTmdbId],
  })

  const reviewsQueryKey = ['movie-reviews', parsedTmdbId] as const
  const movieReviewsQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId),
    queryFn: () => reviewApi.getMovieReviews(parsedTmdbId, 0, REVIEWS_PAGE_SIZE),
    queryKey: [...reviewsQueryKey, 0, REVIEWS_PAGE_SIZE],
  })

  const movieData = movieQuery.data ?? null
  const reviewPage = movieReviewsQuery.data ?? null
  const detailQueryKey = ['movie-details', parsedTmdbId] as const
  const reviews = reviewPage?.content ?? []
  const ownReview: ReviewResponseDTO | null = username && reviewPage
    ? reviewPage.content.find((review) => review.username === username) ?? null
    : null

  const favouriteMutation = useMutation({
    mutationFn: async () => {
      if (!movieData) {
        throw new Error('Movie details are unavailable.')
      }

      return movieData.isFavourited
        ? favouriteApi.removeFavourite(movieData.tmdbId)
        : favouriteApi.addFavourite(movieData.tmdbId)
    },
    onSuccess: async () => {
      if (!movieData) {
        return
      }

      pushToast(movieData.isFavourited ? 'Removed from favourites.' : 'Added to favourites.', 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['favourites'] }),
        queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'continue-watching'] }),
      ])
    },
  })

  const statusMutation = useMutation({
    mutationFn: async (status: WatchStatus) => {
      if (!movieData) {
        throw new Error('Movie details are unavailable.')
      }

      return movieApi.updateMovieStatus(movieData.tmdbId, status)
    },
    onSuccess: async (_, status) => {
      pushToast(status === 'NONE' ? 'Removed movie tracking status.' : 'Movie status updated.', 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
        queryClient.invalidateQueries({ queryKey: ['favourites'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'continue-watching'] }),
      ])
    },
  })

  if (!Number.isFinite(parsedTmdbId)) {
    return (
      <PageContainer className="pt-10">
        <ErrorState body="This movie link is missing a valid title id." heading="Movie unavailable" />
      </PageContainer>
    )
  }

  if (movieQuery.isLoading || movieReviewsQuery.isLoading) {
    return <MovieDetailLoadingState />
  }

  if (movieQuery.isError || movieReviewsQuery.isError || !movieQuery.data || !movieReviewsQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button
                onClick={() => {
                  void movieQuery.refetch()
                  void movieReviewsQuery.refetch()
                }}
                variant="secondary"
              >
                Try again
              </Button>
            }
          />
        </div>
      </PageContainer>
    )
  }

  const movie = movieData!
  const actionPending = favouriteMutation.isPending || statusMutation.isPending

  return (
    <div className="relative isolate overflow-hidden pb-28">
      <DetailHero
        actionArea={
          movie.genres.length > 0 ? (
            <>
              {movie.genres.map((genre) => (
                <GenrePill key={genre}>{genre}</GenrePill>
              ))}
            </>
          ) : undefined
        }
        backdropPath={movie.backdropPath}
        badges={
          <>
            <RatingBadge rating={movie.rating} />
            <WatchStatusBadge status={movie.watchStatus} />
            <FavouriteStatusBadge isFavourited={movie.isFavourited} />
          </>
        }
        meta={
          <>
            <MetadataPill>{formatMediaType(movie.type)}</MetadataPill>
            <MetadataPill>{formatDisplayYear(movie.releaseDate)}</MetadataPill>
          </>
        }
        overview={movie.overview || 'No overview is available for this movie yet.'}
        posterPath={movie.posterPath}
        title={movie.title}
      />

      <PageContainer className="relative z-10 -mt-10 space-y-8 pt-0 md:-mt-14">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Card className="space-y-6 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.32)]">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(173,198,255,0.28)_50%,rgba(255,255,255,0)_100%)]" />
              <SectionHeader eyebrow="Overview" title="What to expect" />
              <p className="max-w-4xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {movie.overview || 'No overview is available for this movie yet.'}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Release date
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-white">
                    <CalendarDays aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                    {formatDisplayDate(movie.releaseDate)}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Viewer status
                  </p>
                  <p className="mt-3 text-sm text-white">
                    {movie.watchStatus && movie.watchStatus !== 'NONE'
                      ? 'Watch status available above'
                      : 'No saved tracking yet.'}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Reviews
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-white">
                    <MessageSquareMore aria-hidden="true" className="size-4 text-[color:var(--color-warning)]" />
                    {reviewPage?.totalElements ?? reviews.length} posted
                  </p>
                </div>
              </div>
            </Card>

            <ReviewList reviews={reviews} />
          </div>

          <div className="space-y-6">
            {isAuthenticated ? (
              <MediaActionsPanel
                isFavourited={movie.isFavourited}
                mediaType={movie.type}
                onOpenWatchlists={() => setWatchlistDialogOpen(true)}
                onSubmitStatus={(status) => statusMutation.mutateAsync(status)}
                onToggleFavourite={() => favouriteMutation.mutateAsync()}
                pending={actionPending}
                watchStatus={movie.watchStatus}
              />
            ) : (
              <ActionPrompt isAuthenticated={isAuthenticated} returnTo={`/movies/${movie.tmdbId}`} />
            )}

            <Card className="space-y-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.88)_0%,rgba(11,12,16,0.98)_100%)] p-6">
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(173,198,255,0.1)_0%,rgba(173,198,255,0)_74%)]" />
              <div className="relative space-y-2.5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  Review note
                </p>
                <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
                  Leave a clean record of the watch.
                </h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Ratings and notes stay attached to this title only, so your watch history stays
                  easy to revisit later.
                </p>
              </div>
            </Card>

            {isAuthenticated ? (
              <ReviewEditorCard
                detailQueryKey={detailQueryKey}
                existingReview={ownReview}
                key={`movie-review-${ownReview?.reviewId ?? 'new'}`}
                mediaType={movie.type}
                reviewQueryKey={reviewsQueryKey}
                tmdbId={movie.tmdbId}
              />
            ) : (
              <Card className="space-y-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.88)_0%,rgba(11,12,16,0.98)_100%)] p-6">
                <div className="space-y-2.5">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                    Viewer note
                  </p>
                  <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
                    Sign in to leave your take.
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    WatchMate keeps your reviews connected to your account so they can follow your
                    watch history.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-tertiary)]">
                  <Sparkles aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                  The sign-in link above keeps this title as your return destination.
                </div>
              </Card>
            )}
          </div>
        </div>

        <WatchlistDialog
          mediaType={movie.type}
          onClose={() => setWatchlistDialogOpen(false)}
          open={watchlistDialogOpen}
          title={movie.title}
          tmdbId={movie.tmdbId}
        />
      </PageContainer>
    </div>
  )
}

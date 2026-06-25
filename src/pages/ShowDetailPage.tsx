import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers3, Sparkles, Tv2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import type { ApiResult } from '../api/client'
import { favouriteApi } from '../api/favouriteApi'
import { pollShowTrackingJob } from '../api/jobsApi'
import { reviewApi } from '../api/reviewApi'
import { showApi } from '../api/showApi'
import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
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
import { NextEpisodeCard } from '../components/media/NextEpisodeCard'
import { RatingBadge } from '../components/media/RatingBadge'
import { ReviewEditorCard } from '../components/media/ReviewEditorCard'
import { ReviewList } from '../components/media/ReviewList'
import { SeasonCard } from '../components/media/SeasonCard'
import { ShowProgressCard } from '../components/media/ShowProgressCard'
import { WatchlistDialog } from '../components/media/WatchlistDialog'
import {
  FavouriteStatusBadge,
  InformationalStatusBadge,
  WatchStatusBadge,
} from '../components/media/StatusBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { ReviewResponseDTO, ShowTrackingJobDTO } from '../types/api'
import type { WatchStatus } from '../types/enums'
import { formatDisplayDate, formatDisplayYear } from '../utils/dates'
import { formatMediaType, formatSeasonLabel, formatTmdbShowStatus } from '../utils/labels'

const REVIEWS_PAGE_SIZE = 20

function ShowDetailLoadingState() {
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

export function ShowDetailPage() {
  const { tmdbId } = useParams()
  const parsedTmdbId = Number(tmdbId)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const username = useAuthStore((state) => state.username)
  const [pendingJobLabel, setPendingJobLabel] = useState<string | null>(null)
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const showQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId),
    queryFn: () => showApi.getShowDetails(parsedTmdbId),
    queryKey: ['show-details', parsedTmdbId],
  })

  const reviewsQueryKey = ['show-reviews', parsedTmdbId] as const
  const showReviewsQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId),
    queryFn: () => reviewApi.getShowReviews(parsedTmdbId, 0, REVIEWS_PAGE_SIZE),
    queryKey: [...reviewsQueryKey, 0, REVIEWS_PAGE_SIZE],
  })

  const nextEpisodeQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId),
    queryFn: () => showApi.getNextEpisode(parsedTmdbId),
    queryKey: ['show-next-episode', parsedTmdbId],
    retry: false,
  })

  const showProgressQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId) && isAuthenticated,
    queryFn: () => showApi.getShowProgress(parsedTmdbId),
    queryKey: ['show-progress', parsedTmdbId],
  })

  const showData = showQuery.data ?? null
  const reviewPage = showReviewsQuery.data ?? null
  const detailQueryKey = ['show-details', parsedTmdbId] as const
  const reviews = reviewPage?.content ?? []
  const ownReview: ReviewResponseDTO | null = username && reviewPage
    ? reviewPage.content.find((review) => review.username === username) ?? null
    : null
  const fallbackNextEpisode = showData
    ? {
        episodeName: showData.nextEpisodeName,
        episodeNumber: showData.nextEpisodeEpisodeNumber,
        lastEpisodeToAirEpisodeNumber: showData.lastEpisodeToAirEpisodeNumber,
        lastEpisodeToAirName: showData.lastEpisodeToAirName,
        lastEpisodeToAirSeasonNumber: showData.lastEpisodeToAirSeasonNumber,
        nextEpisodeAirDate: showData.nextEpisodeAirDate,
        seasonNumber: showData.nextEpisodeSeasonNumber,
        tmdbId: showData.tmdbId,
      }
    : null
  const nextEpisode = nextEpisodeQuery.data ?? fallbackNextEpisode

  async function invalidateShowData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: detailQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['show-progress', parsedTmdbId] }),
      queryClient.invalidateQueries({ queryKey: ['season-episodes', parsedTmdbId] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'continue-watching'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'upcoming-episodes'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'calendar'] }),
      queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
      queryClient.invalidateQueries({ queryKey: ['favourites'] }),
    ])
  }

  async function handleShowMutation(
    runMutation: () => Promise<ApiResult<unknown>>,
    pendingMessage: string,
    successMessage: string,
  ) {
    const result = await runMutation()

    if (result.status === 202) {
      setPendingJobLabel(pendingMessage)
      try {
        const job = await pollShowTrackingJob(result as ApiResult<ShowTrackingJobDTO>)

        if (job.status === 'FAILED') {
          pushToast(job.errorMessage || 'That update could not be completed.', 'error')
          throw new Error(job.errorMessage || 'Show update failed')
        }
      } finally {
        setPendingJobLabel(null)
      }
    }

    pushToast(successMessage, 'success')
    await invalidateShowData()
  }

  const favouriteMutation = useMutation({
    mutationFn: async () => {
      if (!showData) {
        throw new Error('Show details are unavailable.')
      }

      return showData.isFavourited
        ? favouriteApi.removeFavourite(showData.tmdbId)
        : favouriteApi.addFavourite(showData.tmdbId)
    },
    onSuccess: async () => {
      if (!showData) {
        return
      }

      pushToast(showData.isFavourited ? 'Removed from favourites.' : 'Added to favourites.', 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: detailQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['favourites'] }),
        queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
      ])
    },
  })

  const statusMutation = useMutation({
    mutationFn: async (status: WatchStatus) => {
      if (!showData) {
        throw new Error('Show details are unavailable.')
      }

      return handleShowMutation(
        () => showApi.updateShowStatus(showData.tmdbId, status),
        'Updating your show status. This can take a moment for larger histories.',
        status === 'NONE' ? 'Removed show tracking status.' : 'Show status updated.',
      )
    },
  })

  const progressMutation = useMutation({
    mutationFn: async (input: { watchPositionEpisode: number; watchPositionSeason: number }) => {
      if (!showData) {
        throw new Error('Show details are unavailable.')
      }

      return handleShowMutation(
        () => showApi.updateShowProgress(showData.tmdbId, input),
        'Updating your progress across the season. This can take a moment.',
        'Show progress updated.',
      )
    },
  })

  if (!Number.isFinite(parsedTmdbId)) {
    return (
      <PageContainer className="pt-10">
        <ErrorState body="This show link is missing a valid title id." heading="Show unavailable" />
      </PageContainer>
    )
  }

  if (showQuery.isLoading || showReviewsQuery.isLoading) {
    return <ShowDetailLoadingState />
  }

  if (showQuery.isError || showReviewsQuery.isError || !showQuery.data || !showReviewsQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button
                onClick={() => {
                  void showQuery.refetch()
                  void showReviewsQuery.refetch()
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

  const show = showData!
  const nextEpisodeDetails = nextEpisode ?? {
    episodeName: null,
    episodeNumber: null,
    lastEpisodeToAirEpisodeNumber: null,
    lastEpisodeToAirName: null,
    lastEpisodeToAirSeasonNumber: null,
    nextEpisodeAirDate: null,
    seasonNumber: null,
    tmdbId: show.tmdbId,
  }

  const actionPending =
    favouriteMutation.isPending
    || statusMutation.isPending
    || progressMutation.isPending
    || pendingJobLabel !== null

  return (
    <div className="relative isolate overflow-hidden pb-28">
      <DetailHero
        actionArea={
          show.genres.length > 0 ? (
            <>
              {show.genres.map((genre) => (
                <GenrePill key={genre}>{genre}</GenrePill>
              ))}
            </>
          ) : undefined
        }
        backdropPath={show.backdropPath}
        badges={
          <>
            <RatingBadge rating={show.rating} />
            <WatchStatusBadge status={show.watchStatus} />
            <FavouriteStatusBadge isFavourited={show.isFavourited} />
            {formatTmdbShowStatus(show.tmdbShowStatus) ? (
              <InformationalStatusBadge label={formatTmdbShowStatus(show.tmdbShowStatus) ?? ''} />
            ) : null}
          </>
        }
        meta={
          <>
            <MetadataPill>{formatMediaType(show.type)}</MetadataPill>
            <MetadataPill>{formatDisplayYear(show.firstAirDate)}</MetadataPill>
            <MetadataPill>
              {(show.numberOfSeasons ?? 'Unknown').toString()} seasons
            </MetadataPill>
          </>
        }
        overview={show.overview || 'No overview is available for this show yet.'}
        posterPath={show.posterPath}
        title={show.title}
      />

      <PageContainer className="relative z-10 -mt-10 space-y-8 pt-0 md:-mt-14">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <Card className="space-y-6 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.32)]">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(173,198,255,0.28)_50%,rgba(255,255,255,0)_100%)]" />
              <SectionHeader eyebrow="Overview" title="What this show is about" />
              <p className="max-w-4xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {show.overview || 'No overview is available for this show yet.'}
              </p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    First aired
                  </p>
                  <p className="mt-3 text-sm text-white">{formatDisplayDate(show.firstAirDate)}</p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Last aired
                  </p>
                  <p className="mt-3 text-sm text-white">{formatDisplayDate(show.lastAirDate)}</p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Seasons
                  </p>
                  <p className="mt-3 text-sm text-white">{show.numberOfSeasons ?? 'Unknown'}</p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Episodes
                  </p>
                  <p className="mt-3 text-sm text-white">{show.numberOfEpisodes ?? 'Unknown'}</p>
                </div>
              </div>
            </Card>

            <section className="space-y-5">
              <SectionHeader eyebrow="Seasons" title="Browse every season" />
              {show.seasons.length > 0 ? (
                <div className="grid gap-4">
                  {show.seasons.map((season) => (
                    <SeasonCard key={season.seasonNumber} season={season} showTmdbId={show.tmdbId} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  body="Season information is not available for this show yet."
                  heading="No seasons to show"
                  icon={<Layers3 aria-hidden="true" className="size-5" />}
                />
              )}
            </section>

            <ReviewList reviews={reviews} />
          </div>

          <div className="space-y-6">
            {isAuthenticated ? (
              <MediaActionsPanel
                isFavourited={show.isFavourited}
                mediaType={show.type}
                onOpenWatchlists={() => setWatchlistDialogOpen(true)}
                onSubmitStatus={(status) => statusMutation.mutateAsync(status)}
                onToggleFavourite={() => favouriteMutation.mutateAsync()}
                pending={actionPending}
                watchStatus={show.watchStatus}
              />
            ) : (
              <ActionPrompt isAuthenticated={isAuthenticated} returnTo={`/shows/${show.tmdbId}`} />
            )}

            <NextEpisodeCard nextEpisode={nextEpisodeDetails} />

            {isAuthenticated ? (
              <ShowProgressCard
                onSubmitProgress={(input) => progressMutation.mutateAsync(input)}
                pending={actionPending}
                pendingLabel={pendingJobLabel}
                progress={showProgressQuery.data ?? null}
                seasons={show.seasons}
                tmdbId={show.tmdbId}
              />
            ) : (
              <Card className="space-y-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.88)_0%,rgba(11,12,16,0.98)_100%)] p-6">
                <SectionHeader eyebrow="Viewer note" title="Progress stays on the show page." />
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Sign in to save where you are and keep episode progress in sync.
                </p>
              </Card>
            )}

            {show.nextEpisodeSeasonNumber !== null && show.nextEpisodeEpisodeNumber !== null ? (
              <Card className="space-y-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.88)_0%,rgba(11,12,16,0.98)_100%)] p-6">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(255,222,164,0.08)_0%,rgba(255,222,164,0)_74%)]" />
                <div className="relative space-y-4">
                  <SectionHeader eyebrow="Up next" title="Jump to the current season" />
                  <Link
                    className={getButtonClassName('secondary')}
                    to={`/shows/${show.tmdbId}/seasons/${show.nextEpisodeSeasonNumber}/episodes`}
                  >
                    <Tv2 aria-hidden="true" className="mr-2 size-4" />
                    {formatSeasonLabel(show.nextEpisodeSeasonNumber)}
                  </Link>
                </div>
              </Card>
            ) : null}

            <Card className="space-y-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.88)_0%,rgba(11,12,16,0.98)_100%)] p-6">
              <div className="space-y-2.5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  Tracking note
                </p>
                <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
                  Keep the season timeline tidy.
                </h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Status, favourites, watchlists, and progress all stay connected here so the rest
                  of WatchMate can stay in sync.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-tertiary)]">
                <Sparkles aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                Pending progress updates are shown in plain language while the sync finishes.
              </div>
            </Card>

            {isAuthenticated ? (
              <ReviewEditorCard
                detailQueryKey={detailQueryKey}
                existingReview={ownReview}
                key={`show-review-${ownReview?.reviewId ?? 'new'}`}
                mediaType={show.type}
                reviewQueryKey={reviewsQueryKey}
                tmdbId={show.tmdbId}
              />
            ) : null}
          </div>
        </div>

        <WatchlistDialog
          mediaType={show.type}
          onClose={() => setWatchlistDialogOpen(false)}
          open={watchlistDialogOpen}
          title={show.title}
          tmdbId={show.tmdbId}
        />
      </PageContainer>
    </div>
  )
}

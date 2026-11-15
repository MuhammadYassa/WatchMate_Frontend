import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock3, ListVideo } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import type { ApiResult } from '../api/client'
import { pollShowTrackingJob } from '../api/jobsApi'
import { showApi } from '../api/showApi'
import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster, SkeletonText } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { EpisodeCard } from '../components/media/EpisodeCard'
import { GenrePill } from '../components/media/GenrePill'
import { PosterPlaceholder } from '../components/media/PosterPlaceholder'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import type { ShowTrackingJobDTO } from '../types/api'
import { formatDisplayDate } from '../utils/dates'
import { formatSeasonLabel } from '../utils/labels'
import { prefersReducedMotion } from '../utils/motion'
import { getPosterUrl, hasImagePath } from '../utils/tmdbImages'

function SeasonEpisodesLoadingState() {
  return (
    <div className="wm-season-page relative isolate overflow-hidden pb-28">
      <section className="wm-season-hero relative overflow-hidden border-b border-white/10 bg-[color:var(--color-bg)]">
        <BrowsePageAtmosphere variant="hero" />
        <div className="wm-season-inner relative z-10 mx-auto max-w-[1380px] px-4 pb-10 pt-6 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
          <div className="wm-season-grid grid grid-cols-[6.75rem_minmax(0,1fr)] items-end gap-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] md:grid-cols-[11rem_minmax(0,1fr)] lg:min-h-[30rem] lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-8">
            <SkeletonPoster />
            <div className="min-w-0 space-y-4 lg:space-y-5">
              <Skeleton className="hidden h-9 w-32 rounded-[14px] lg:block" />
              <Skeleton className="h-12 w-full max-w-3xl rounded-[var(--radius-panel)] lg:h-20" />
              <SkeletonText />
            </div>
          </div>
        </div>
      </section>
      <PageContainer className="relative z-10 -mt-10 space-y-6 pt-0 md:-mt-14">
        <Skeleton className="h-44 rounded-[var(--radius-panel)]" />
        <Skeleton className="h-44 rounded-[var(--radius-panel)]" />
      </PageContainer>
    </div>
  )
}

export function SeasonEpisodesPage() {
  const { seasonNumber, tmdbId } = useParams()
  const parsedTmdbId = Number(tmdbId)
  const parsedSeasonNumber = Number(seasonNumber)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const [episodePage, setEpisodePage] = useState(0)

  const enabled = Number.isFinite(parsedTmdbId) && Number.isFinite(parsedSeasonNumber)

  const showDetailsQuery = useQuery({
    enabled,
    queryFn: () => showApi.getShowDetails(parsedTmdbId),
    queryKey: ['show-details', parsedTmdbId],
  })

  const episodesQuery = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: () => showApi.getSeasonEpisodes(parsedTmdbId, parsedSeasonNumber, episodePage),
    queryKey: ['season-episodes', parsedTmdbId, parsedSeasonNumber, episodePage],
  })

  const progressMutation = useMutation({
    mutationFn: async (input: { watchPositionEpisode: number; watchPositionSeason: number }) => {
      const result = await showApi.updateShowProgress(parsedTmdbId, input)

      if (result.status === 202) {
        const job = await pollShowTrackingJob(result as ApiResult<ShowTrackingJobDTO>)

        if (job.status === 'FAILED') {
          throw new Error(job.errorMessage || 'Progress update failed.')
        }
      }

      return result
    },
    onError: () => {
      pushToast('Could not update episode progress.', 'error')
    },
    onSuccess: async () => {
      pushToast('Episode progress updated.', 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['season-episodes', parsedTmdbId, parsedSeasonNumber] }),
        queryClient.invalidateQueries({ queryKey: ['show-progress', parsedTmdbId] }),
        queryClient.invalidateQueries({ queryKey: ['show-details', parsedTmdbId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'continue-watching'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'to-watch'] }),
      ])
    },
  })

  const isSyncing = progressMutation.isPending
  const isPageTransitioning = episodesQuery.isFetching && !episodesQuery.isLoading

  if (!Number.isFinite(parsedTmdbId) || !Number.isFinite(parsedSeasonNumber)) {
    return (
      <PageContainer className="pt-10">
        <ErrorState
          body="This season link is missing a valid show or season id."
          heading="Season unavailable"
        />
      </PageContainer>
    )
  }

  if (showDetailsQuery.isLoading || episodesQuery.isLoading) {
    return <SeasonEpisodesLoadingState />
  }

  if (showDetailsQuery.isError || episodesQuery.isError || !episodesQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button
                onClick={() => {
                  void showDetailsQuery.refetch()
                  void episodesQuery.refetch()
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

  const seasonMeta = showDetailsQuery.data?.seasons.find(
    (s) => s.seasonNumber === parsedSeasonNumber,
  )

  const episodes = episodesQuery.data.content
  const totalEpisodes = episodesQuery.data.totalElements

  const seasonLabel = formatSeasonLabel(parsedSeasonNumber)
  const airedEpisodes = episodes.filter((episode) => episode.isAired !== false).length
  const watchedEpisodes = episodes.filter((episode) => episode.watched).length
  const runtimeMinutes = episodes.reduce((total, episode) => total + (episode.runtime ?? 0), 0)

  const posterPath = seasonMeta?.posterPath ?? null
  const seasonName = seasonMeta?.name || seasonLabel
  const seasonOverview = seasonMeta?.overview || ''
  const airDate = seasonMeta?.airDate ?? null
  const episodeCount = seasonMeta?.episodeCount ?? totalEpisodes

  return (
    <div className="wm-season-page relative isolate overflow-hidden pb-28">
      <section className="wm-season-hero relative overflow-hidden border-b border-white/10 bg-[color:var(--color-bg)]">
        {hasImagePath(posterPath) ? (
          <img
            alt=""
            className="motion-hero-img absolute inset-0 h-full w-full object-cover [--hero-img-opacity:0.24]"
            src={getPosterUrl(posterPath, 'w500') ?? undefined}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.24)_0%,rgba(7,8,11,0.84)_58%,rgba(7,8,11,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,8,11,0.98)_14%,rgba(7,8,11,0.86)_52%,rgba(7,8,11,0.52)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,174,126,0.14)_0%,rgba(47,174,126,0)_34%)]" />

        <div className="wm-season-inner relative z-10 mx-auto max-w-[1380px] px-4 pb-10 pt-6 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 md:pb-6">
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--color-accent)] transition hover:text-white"
              to={`/shows/${parsedTmdbId}`}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to show
            </Link>
            <GenrePill>{parsedSeasonNumber === 0 ? 'Specials' : seasonLabel}</GenrePill>
          </div>

          <div className="wm-season-grid grid grid-cols-[6.75rem_minmax(0,1fr)] items-end gap-x-4 gap-y-5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-6 md:grid-cols-[11rem_minmax(0,1fr)] lg:min-h-[30rem] lg:grid-cols-[292px_minmax(0,1fr)] lg:content-end lg:gap-x-8 lg:gap-y-6 xl:grid-cols-[336px_minmax(0,1fr)]">
            <div className="w-full lg:row-span-2">
              <div className="motion-poster relative overflow-hidden rounded-[var(--radius-panel)] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_18px_44px_rgba(0,0,0,0.38)] lg:shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
                {hasImagePath(posterPath) ? (
                  <img
                    alt={`${seasonName} poster`}
                    className="aspect-[2/3] w-full object-cover"
                    src={getPosterUrl(posterPath, 'w500') ?? undefined}
                  />
                ) : (
                  <PosterPlaceholder title={seasonName} />
                )}
              </div>
            </div>

            <div className="min-w-0 space-y-2 self-end lg:space-y-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)] sm:text-[11px] sm:tracking-[0.32em]">
                {seasonLabel}
              </p>
              <h1 className="break-words font-display text-[length:clamp(1.55rem,6.8vw,2.1rem)] leading-[1.04] tracking-[-0.03em] text-white md:text-6xl md:leading-[0.94] xl:text-[5rem]">
                {seasonName}
              </h1>
              <p className="hidden max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:block md:text-base">
                {seasonOverview || 'No season overview is available yet.'}
              </p>
            </div>

            <div className="col-span-2 min-w-0 space-y-4 lg:col-span-1 lg:col-start-2 lg:space-y-6 lg:pb-2">
              <div className="flex flex-wrap gap-2 lg:gap-2.5">
                <GenrePill>{episodeCount} episodes</GenrePill>
                <GenrePill>{formatDisplayDate(airDate)}</GenrePill>
                {parsedSeasonNumber === 0 ? <GenrePill>Special collection</GenrePill> : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 sm:block sm:p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)] sm:tracking-[0.28em]">
                    Watched
                  </p>
                  <p className="text-sm text-white sm:mt-3">
                    {watchedEpisodes} of {episodes.length}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 sm:block sm:p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)] sm:tracking-[0.28em]">
                    Aired now
                  </p>
                  <p className="text-sm text-white sm:mt-3">{airedEpisodes} available</p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 sm:block sm:p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)] sm:tracking-[0.28em]">
                    Runtime
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm text-white sm:mt-3">
                    <Clock3 aria-hidden="true" className="size-4 text-[color:var(--color-warning)]" />
                    {runtimeMinutes > 0 ? `${runtimeMinutes}m total` : 'Unavailable'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageContainer className="relative z-10 -mt-10 space-y-8 pt-0 md:-mt-14">
        <section className="scroll-mt-24 space-y-5" id="season-lineup">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader eyebrow="Episodes" title="Season lineup" />
            <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-text-tertiary)]">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-[color:var(--color-accent)]" />
                Watched
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-white/25" />
                Remaining
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-[color:var(--color-warning)]" />
                Unaired
              </span>
            </div>
          </div>

          {isSyncing ? (
            <p
              aria-live="polite"
              className="rounded-[var(--radius-panel)] border border-[rgba(47,174,126,0.20)] bg-[rgba(47,174,126,0.08)] px-4 py-3 text-sm text-[color:var(--color-accent)]"
            >
              Syncing progress…
            </p>
          ) : null}
          {isPageTransitioning ? (
            <p
              aria-live="polite"
              className="rounded-[var(--radius-panel)] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]"
            >
              Loading episodes…
            </p>
          ) : null}
          {episodes.length > 0 ? (
            <>
              <div className={`grid gap-4 transition-opacity duration-200 ${isPageTransitioning ? 'opacity-40' : ''}`}>
                {episodes.map((episode, index) => (
                  <div
                    className="motion-slide-up"
                    key={`${episode.seasonNumber}-${episode.episodeNumber}`}
                    style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
                  >
                    <EpisodeCard
                      episode={episode}
                      onTick={
                        isAuthenticated && episode.isAired !== false
                          ? () =>
                              progressMutation.mutate({
                                watchPositionEpisode: episode.episodeNumber,
                                watchPositionSeason: episode.seasonNumber,
                              })
                          : undefined
                      }
                      tickPending={isSyncing}
                    />
                  </div>
                ))}
              </div>
              <Pagination
                className="border-t border-white/8 pt-6"
                onPageChange={(nextPage) => {
                  setEpisodePage(nextPage)
                  const target = document.getElementById('season-lineup')
                  target?.scrollIntoView?.({
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    block: 'start',
                  })
                }}
                page={episodePage}
                totalPages={episodesQuery.data?.totalPages ?? 1}
              />
            </>
          ) : (
            <EmptyState
              body="Episode details are not available for this season yet."
              heading="No episodes to show"
              icon={<ListVideo aria-hidden="true" className="size-5" />}
            />
          )}
        </section>
      </PageContainer>
    </div>
  )
}

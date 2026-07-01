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
import type { ShowTrackingJobDTO } from '../types/api'
import { formatDisplayDate } from '../utils/dates'
import { formatSeasonLabel } from '../utils/labels'
import { getPosterUrl, hasImagePath } from '../utils/tmdbImages'

function SeasonEpisodesLoadingState() {
  return (
    <div className="relative isolate overflow-hidden pb-28">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0e11]">
        <BrowsePageAtmosphere variant="hero" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
          <div className="grid items-end gap-8 lg:min-h-[30rem] lg:grid-cols-[292px_minmax(0,1fr)]">
            <SkeletonPoster />
            <div className="space-y-5">
              <Skeleton className="h-9 w-32 rounded-[14px]" />
              <Skeleton className="h-20 w-full max-w-3xl rounded-[var(--radius-panel)]" />
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
    <div className="relative isolate overflow-hidden pb-28">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0e11]">
        {hasImagePath(posterPath) ? (
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-24"
            src={getPosterUrl(posterPath, 'w500') ?? undefined}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.24)_0%,rgba(7,8,11,0.84)_58%,rgba(7,8,11,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,8,11,0.98)_14%,rgba(7,8,11,0.86)_52%,rgba(7,8,11,0.52)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,174,126,0.14)_0%,rgba(47,174,126,0)_34%)]" />

        <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
            <Link
              className="inline-flex items-center gap-2 text-sm text-[color:var(--color-accent)] transition hover:text-white"
              to={`/shows/${parsedTmdbId}`}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to show
            </Link>
            <GenrePill>{parsedSeasonNumber === 0 ? 'Specials' : seasonLabel}</GenrePill>
          </div>

          <div className="grid items-end gap-8 lg:min-h-[30rem] lg:grid-cols-[292px_minmax(0,1fr)] xl:grid-cols-[336px_minmax(0,1fr)]">
            <div className="w-full max-w-[280px] lg:max-w-none">
              <div className="motion-poster relative overflow-hidden rounded-[var(--radius-panel)] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
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

            <div className="space-y-6 pb-2">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  {seasonLabel}
                </p>
                <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.03em] text-white md:text-6xl xl:text-[5rem]">
                  {seasonName}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
                  {seasonOverview || 'No season overview is available yet.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <GenrePill>{episodeCount} episodes</GenrePill>
                <GenrePill>{formatDisplayDate(airDate)}</GenrePill>
                {parsedSeasonNumber === 0 ? <GenrePill>Special collection</GenrePill> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Watched
                  </p>
                  <p className="mt-3 text-sm text-white">
                    {watchedEpisodes} of {episodes.length}
                  </p>
                </div>
                <div className="rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Aired now
                  </p>
                  <p className="mt-3 text-sm text-white">{airedEpisodes} available</p>
                </div>
                <div className="rounded-[var(--radius-panel)] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Runtime
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-white">
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
        <section className="space-y-5">
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
              {(episodesQuery.data?.totalPages ?? 1) > 1 ? (
                <div className="flex items-center justify-between border-t border-white/8 pt-6">
                  <Button
                    disabled={episodePage === 0}
                    onClick={() => setEpisodePage((p) => Math.max(0, p - 1))}
                    variant="ghost"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-[color:var(--color-text-secondary)]">
                    Page {episodePage + 1} of {episodesQuery.data?.totalPages ?? 1}
                  </span>
                  <Button
                    disabled={episodePage + 1 >= (episodesQuery.data?.totalPages ?? 1)}
                    onClick={() => setEpisodePage((p) => p + 1)}
                    variant="ghost"
                  >
                    Next
                  </Button>
                </div>
              ) : null}
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

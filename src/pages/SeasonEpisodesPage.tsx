import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock3, ListVideo } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { showApi } from '../api/showApi'
import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster, SkeletonText } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { EpisodeCard } from '../components/media/EpisodeCard'
import { GenrePill } from '../components/media/GenrePill'
import { PosterPlaceholder } from '../components/media/PosterPlaceholder'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
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
              <Skeleton className="h-20 w-full max-w-3xl rounded-[20px]" />
              <SkeletonText />
            </div>
          </div>
        </div>
      </section>
      <PageContainer className="relative z-10 -mt-10 space-y-6 pt-0 md:-mt-14">
        <Skeleton className="h-44 rounded-[24px]" />
        <Skeleton className="h-44 rounded-[24px]" />
      </PageContainer>
    </div>
  )
}

export function SeasonEpisodesPage() {
  const { seasonNumber, tmdbId } = useParams()
  const parsedTmdbId = Number(tmdbId)
  const parsedSeasonNumber = Number(seasonNumber)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))

  const seasonQuery = useQuery({
    enabled: Number.isFinite(parsedTmdbId) && Number.isFinite(parsedSeasonNumber),
    queryFn: () => showApi.getSeasonEpisodes(parsedTmdbId, parsedSeasonNumber),
    queryKey: ['season-episodes', parsedTmdbId, parsedSeasonNumber],
  })

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

  if (seasonQuery.isLoading) {
    return <SeasonEpisodesLoadingState />
  }

  if (seasonQuery.isError || !seasonQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => seasonQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
          />
        </div>
      </PageContainer>
    )
  }

  const season = seasonQuery.data
  const seasonLabel = formatSeasonLabel(season.seasonNumber)
  const airedEpisodes = season.episodes.filter((episode) => episode.isAired !== false).length
  const watchedEpisodes = season.episodes.filter((episode) => episode.watched).length
  const runtimeMinutes = season.episodes.reduce((total, episode) => total + (episode.runtime ?? 0), 0)

  return (
    <div className="relative isolate overflow-hidden pb-28">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0e11]">
        {hasImagePath(season.posterPath) ? (
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-24"
            src={getPosterUrl(season.posterPath, 'w500') ?? undefined}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.24)_0%,rgba(7,8,11,0.84)_58%,rgba(7,8,11,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,8,11,0.98)_14%,rgba(7,8,11,0.86)_52%,rgba(7,8,11,0.52)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.18)_0%,rgba(173,198,255,0)_34%)]" />

        <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
            <Link
              className="inline-flex items-center gap-2 text-sm text-[color:var(--color-accent)] transition hover:text-white"
              to={`/shows/${season.tmdbId}`}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to show
            </Link>
            <GenrePill>{season.seasonNumber === 0 ? 'Specials' : seasonLabel}</GenrePill>
          </div>

          <div className="grid items-end gap-8 lg:min-h-[30rem] lg:grid-cols-[292px_minmax(0,1fr)] xl:grid-cols-[336px_minmax(0,1fr)]">
            <div className="w-full max-w-[280px] lg:max-w-none">
              <div className="motion-poster relative overflow-hidden rounded-[22px] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
                {hasImagePath(season.posterPath) ? (
                  <img
                    alt={`${season.name || seasonLabel} poster`}
                    className="aspect-[2/3] w-full object-cover"
                    src={getPosterUrl(season.posterPath, 'w500') ?? undefined}
                  />
                ) : (
                  <PosterPlaceholder title={season.name || seasonLabel} />
                )}
              </div>
            </div>

            <div className="space-y-6 pb-2">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  {seasonLabel}
                </p>
                <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.055em] text-white md:text-6xl xl:text-[5rem]">
                  {season.name || seasonLabel}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
                  {season.overview || 'No season overview is available yet.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <GenrePill>{season.episodeCount} episodes</GenrePill>
                <GenrePill>{formatDisplayDate(season.airDate)}</GenrePill>
                {season.seasonNumber === 0 ? <GenrePill>Special collection</GenrePill> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Watched
                  </p>
                  <p className="mt-3 text-sm text-white">
                    {watchedEpisodes} of {season.episodes.length}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                    Aired now
                  </p>
                  <p className="mt-3 text-sm text-white">{airedEpisodes} available</p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
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
        <Card className="space-y-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-6">
          <SectionHeader eyebrow="Progress note" title="Episode progress is shown here only." />
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
            {isAuthenticated
              ? 'Progress updates are set from the show page in the next step. This season view stays read-only for now.'
              : 'Sign in to see your tracking overlays when progress tools arrive in the next step.'}
          </p>
        </Card>

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

          {season.episodes.length > 0 ? (
            <div className="grid gap-4">
              {season.episodes.map((episode, index) => (
                <div
                  className="motion-slide-up"
                  key={`${episode.seasonNumber}-${episode.episodeNumber}`}
                  style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
                >
                  <EpisodeCard episode={episode} />
                </div>
              ))}
            </div>
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

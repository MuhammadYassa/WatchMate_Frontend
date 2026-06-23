import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ListVideo } from 'lucide-react'
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
        <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-12 pt-24 sm:px-6 md:pb-14 md:pt-28 lg:px-8 xl:px-12">
          <div className="grid items-end gap-8 lg:min-h-[26rem] lg:grid-cols-[260px_minmax(0,1fr)]">
            <SkeletonPoster />
            <div className="space-y-5">
              <Skeleton className="h-9 w-32 rounded-[14px]" />
              <Skeleton className="h-20 w-full max-w-3xl rounded-[20px]" />
              <SkeletonText />
            </div>
          </div>
        </div>
      </section>
      <PageContainer className="relative z-10 -mt-8 space-y-6 pt-0 md:-mt-12">
        <Skeleton className="h-44 rounded-[28px]" />
        <Skeleton className="h-44 rounded-[28px]" />
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

  return (
    <div className="relative isolate overflow-hidden pb-28">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0e11]">
        {hasImagePath(season.posterPath) ? (
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            src={getPosterUrl(season.posterPath, 'w500') ?? undefined}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.3)_0%,rgba(7,8,11,0.82)_58%,rgba(7,8,11,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,8,11,0.96)_14%,rgba(7,8,11,0.82)_52%,rgba(7,8,11,0.52)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.18)_0%,rgba(173,198,255,0)_34%)]" />

        <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-12 pt-24 sm:px-6 md:pb-14 md:pt-28 lg:px-8 xl:px-12">
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

          <div className="grid items-end gap-8 lg:min-h-[26rem] lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="w-full max-w-[260px] lg:max-w-none">
              <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
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

            <div className="space-y-5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                {seasonLabel}
              </p>
              <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.05em] text-white md:text-6xl">
                {season.name || seasonLabel}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
                {season.overview || 'No season overview is available yet.'}
              </p>
              <div className="flex flex-wrap gap-2.5">
                <GenrePill>{season.episodeCount} episodes</GenrePill>
                <GenrePill>{formatDisplayDate(season.airDate)}</GenrePill>
                {season.seasonNumber === 0 ? <GenrePill>Special collection</GenrePill> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageContainer className="relative z-10 -mt-8 space-y-8 pt-0 md:-mt-12">
        <Card className="space-y-4 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-6">
          <SectionHeader eyebrow="Progress note" title="Episode progress is shown here only." />
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
            {isAuthenticated
              ? 'Progress updates are set from the show page in the next step. This season view stays read-only for now.'
              : 'Sign in to see your tracking overlays when progress tools arrive in the next step.'}
          </p>
        </Card>

        <section className="space-y-5">
          <SectionHeader eyebrow="Episodes" title="Season lineup" />
          {season.episodes.length > 0 ? (
            <div className="grid gap-4">
              {season.episodes.map((episode) => (
                <EpisodeCard episode={episode} key={`${episode.seasonNumber}-${episode.episodeNumber}`} />
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

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Layers3 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { dashboardApi } from '../api/dashboardApi'
import { homeApi } from '../api/homeApi'
import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { BackdropHero } from '../components/media/BackdropHero'
import { GenreChip } from '../components/media/GenreChip'
import { MediaRail } from '../components/media/MediaRail'
import {
  PosterCard,
  PosterCardActionLink,
} from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import type { DiscoveryMediaItemDTO } from '../types/api'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'

function HomeLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-[420px] rounded-[38px]" />
      {[0, 1, 2].map((section) => (
        <div className="relative z-10 space-y-5" key={section}>
          <Skeleton className="h-8 w-56" />
          <div className="flex gap-4 overflow-hidden">
            <SkeletonPoster />
            <SkeletonPoster />
            <SkeletonPoster />
          </div>
        </div>
      ))}
    </PageContainer>
  )
}

function getHomeHero(homeData: Awaited<ReturnType<typeof homeApi.getHome>>) {
  const sections = [
    homeData.trendingMovies,
    homeData.trendingShows,
    homeData.popularNow,
    homeData.upcoming,
  ]

  return sections.flat().find(Boolean) ?? null
}

function GenrePanel({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,19,23,0.88)_0%,rgba(11,12,16,0.96)_100%)] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)] md:px-6 md:py-6">
      <div className="space-y-4">
        <SectionHeader eyebrow="Genres" title={title} />
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))

  const homeQuery = useQuery({
    queryFn: homeApi.getHome,
    queryKey: ['home'],
  })

  const continueWatchingQuery = useQuery({
    enabled: isAuthenticated,
    queryFn: () => dashboardApi.getContinueWatching(10),
    queryKey: ['dashboard', 'continue-watching', 10],
  })

  if (homeQuery.isLoading) {
    return <HomeLoadingState />
  }

  if (homeQuery.isError || !homeQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => homeQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
          />
        </div>
      </PageContainer>
    )
  }

  const hero = getHomeHero(homeQuery.data)
  const sections: Array<{
    items: DiscoveryMediaItemDTO[]
    title: string
  }> = [
    { items: homeQuery.data.trendingMovies, title: 'Trending Movies' },
    { items: homeQuery.data.trendingShows, title: 'Trending Shows' },
    { items: homeQuery.data.popularNow, title: 'Popular Now' },
    { items: homeQuery.data.airingToday, title: 'Airing Today' },
    { items: homeQuery.data.upcoming, title: 'Upcoming' },
    { items: homeQuery.data.recommendedLater, title: 'Recommended Later' },
  ]

  return (
    <PageContainer className="relative isolate space-y-12 overflow-hidden pt-8 md:space-y-14 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <div className="relative z-10">
        {hero ? (
          <BackdropHero
            ctaHref={getMediaRoute(hero.tmdbId, hero.type)}
            ctaLabel={`View ${hero.title}`}
            imagePath={hero.backdropPath}
            meta={hero.type === 'MOVIE' ? 'Featured movie' : 'Featured show'}
            subtitle={hero.overview || "A standout title from today's WatchMate feed."}
            title={hero.title}
          />
        ) : (
          <EmptyState
            body="The home feed is empty right now. Try again in a moment."
            heading="Nothing to show yet"
            icon={<Layers3 aria-hidden="true" className="size-5" />}
          />
        )}
      </div>

      {isAuthenticated && continueWatchingQuery.data?.items.length ? (
        <section className="relative z-10 space-y-5">
          <SectionHeader eyebrow="Your queue" title="Continue watching" />
          <MediaRail className="pr-2">
            {continueWatchingQuery.data.items.map((item) => (
              <PosterCard
                key={`${item.type}-${item.tmdbId}`}
                href={getMediaRoute(item.tmdbId, item.type)}
                imagePath={item.posterPath}
                mediaTypeLabel={
                  item.type === 'SHOW' && item.resumeSeasonNumber && item.resumeEpisodeNumber
                    ? `Resume S${item.resumeSeasonNumber} E${item.resumeEpisodeNumber}`
                    : formatMediaType(item.type)
                }
                rating={item.rating}
                title={item.title}
              />
            ))}
          </MediaRail>
        </section>
      ) : null}

      {sections.map((section) =>
        section.items.length > 0 ? (
          <section className="relative z-10 space-y-5" key={section.title}>
            <SectionHeader
              action={<PosterCardActionLink href="/discover" label="Explore more" />}
              eyebrow="Browse"
              title={section.title}
            />
            <MediaRail className="pr-2">
              {section.items.map((item) => (
                <PosterCard
                  key={`${section.title}-${item.tmdbId}`}
                  href={getMediaRoute(item.tmdbId, item.type)}
                  imagePath={item.posterPath}
                  mediaTypeLabel={formatMediaType(item.type)}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  title={item.title}
                />
              ))}
            </MediaRail>
          </section>
        ) : null,
      )}

      <section className="relative z-10 grid gap-6 lg:grid-cols-2">
        <GenrePanel title="Browse movie genres">
          {homeQuery.data.movieGenres.map((genre) => (
            <GenreChip
              key={genre}
              onClick={() => navigate(`/discover?genreType=movie&genre=${encodeURIComponent(genre)}`)}
            >
              {genre}
            </GenreChip>
          ))}
        </GenrePanel>
        <GenrePanel title="Browse show genres">
          {homeQuery.data.showGenres.map((genre) => (
            <GenreChip
              key={genre}
              onClick={() => navigate(`/discover?genreType=show&genre=${encodeURIComponent(genre)}`)}
            >
              {genre}
            </GenreChip>
          ))}
        </GenrePanel>
      </section>

      {!isAuthenticated ? (
        <div className="relative z-10 overflow-hidden rounded-[30px] border border-[rgba(173,198,255,0.2)] bg-[linear-gradient(145deg,rgba(26,30,38,0.92)_0%,rgba(13,15,20,0.98)_100%)] px-5 py-5 shadow-[0_26px_60px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(173,198,255,0.14)_0%,rgba(173,198,255,0)_72%)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
                Join WatchMate
              </p>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                Create an account to carry your progress, favourites, and watchlists with you.
              </span>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-accent)] transition hover:text-white"
              to="/register"
            >
              Start tracking <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}

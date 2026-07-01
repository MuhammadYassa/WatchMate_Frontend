import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Layers3, PlayCircle } from 'lucide-react'
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
import { GenreChip } from '../components/media/GenreChip'
import { MediaRail } from '../components/media/MediaRail'
import { PosterCard, PosterCardActionLink } from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { DiscoveryMediaItemDTO } from '../types/api'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'
import { getBackdropUrl } from '../utils/tmdbImages'

function HomeLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-12 overflow-hidden pt-6 md:pt-8">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="-mx-4 h-[72vh] min-h-[34rem] rounded-none sm:-mx-6 lg:-mx-8 xl:-mx-12" />
      <div className="space-y-4">
        <Skeleton className="h-14 w-full max-w-3xl rounded-[16px]" />
        <div className="flex gap-4 overflow-hidden">
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
        </div>
      </div>
      {[0, 1].map((section) => (
        <div className="space-y-5" key={section}>
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

function CompactGenreShelf({
  movieGenres,
  onMovieGenre,
  onShowGenre,
  showGenres,
}: {
  movieGenres: string[]
  onMovieGenre: (genre: string) => void
  onShowGenre: (genre: string) => void
  showGenres: string[]
}) {
  const featuredMovieGenres = movieGenres.slice(0, 4)
  const featuredShowGenres = showGenres.slice(0, 4)

  return (
    <div className="rounded-[var(--radius-panel)] border border-white/8 bg-[rgba(12,13,17,0.84)] px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-5">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto_1fr] lg:items-center">
        <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">Movies</p>
        <div className="flex flex-wrap gap-2.5">
          <span className="sr-only">Browse movie genres</span>
          {featuredMovieGenres.map((genre) => (
            <GenreChip key={`movie-${genre}`} onClick={() => onMovieGenre(genre)}>
              {genre}
            </GenreChip>
          ))}
        </div>
        <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">Shows</p>
        <div className="flex flex-wrap gap-2.5">
          {featuredShowGenres.map((genre) => (
            <GenreChip key={`show-${genre}`} onClick={() => onShowGenre(genre)}>
              {genre}
            </GenreChip>
          ))}
        </div>
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

  const continueWatchingItems = continueWatchingQuery.data?.items ?? []

  return (
    <div className="relative isolate overflow-hidden pb-24">
      <BrowsePageAtmosphere variant="hero" />

      {hero ? (
        <section className="relative min-h-[84vh] overflow-hidden border-b border-white/6">
          {hero.backdropPath ? (
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-72"
              src={getBackdropUrl(hero.backdropPath, 'w1280') ?? undefined}
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(47,174,126,0.12),transparent_22%),linear-gradient(180deg,rgba(8,7,6,0.14)_0%,rgba(8,7,6,0.34)_24%,rgba(8,7,6,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,13,0.96)_8%,rgba(10,10,13,0.78)_38%,rgba(10,10,13,0.3)_100%)]" />

          <div className="relative mx-auto flex min-h-[84vh] max-w-[1440px] items-end px-4 pb-18 pt-28 sm:px-6 lg:px-8 xl:px-12">
            <div className="motion-stagger max-w-3xl space-y-6">
              <div className="space-y-4">
                <h1 className="font-display text-[3.6rem] leading-[0.92] tracking-[-0.03em] text-white sm:text-[4.7rem] md:text-[5.8rem]">
                  {hero.title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)] md:text-lg">
                  {hero.overview || "A standout title from today's WatchMate feed."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  className={getButtonClassName('primary', 'min-w-[12rem]')}
                  to={getMediaRoute(hero.tmdbId, hero.type)}
                >
                  View {hero.title}
                </Link>
                <Link className={getButtonClassName('secondary', 'min-w-[12rem]')} to="/discover">
                  Explore titles
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <PageContainer className="relative isolate overflow-hidden pt-10">
          <div className="relative z-10">
            <EmptyState
              body="The home feed is empty right now. Try again in a moment."
              heading="Nothing to show yet"
              icon={<Layers3 aria-hidden="true" className="size-5" />}
            />
          </div>
        </PageContainer>
      )}

      <div className="relative z-10 -mt-6 md:-mt-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <CompactGenreShelf
            movieGenres={homeQuery.data.movieGenres}
            onMovieGenre={(genre) => navigate(`/discover?genreType=movie&genre=${encodeURIComponent(genre)}`)}
            onShowGenre={(genre) => navigate(`/discover?genreType=show&genre=${encodeURIComponent(genre)}`)}
            showGenres={homeQuery.data.showGenres}
          />
        </div>
      </div>

      {isAuthenticated && continueWatchingItems.length > 0 ? (
        <section className="relative z-10 mt-12">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="motion-stagger space-y-5">
              <SectionHeader  title="Continue watching" />
              <MediaRail className="pr-0">
                {continueWatchingItems.map((item) => (
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
            </div>
          </div>
        </section>
      ) : null}

      {sections.map((section, index) =>
        section.items.length > 0 ? (
          <section className="relative z-10 mt-14" key={section.title}>
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="space-y-5">
                <SectionHeader
                  action={
                    index < 2 ? <PosterCardActionLink href="/discover" label="Explore more" /> : undefined
                  }
                  
                  title={section.title}
                />
                <MediaRail className="pr-0">
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
              </div>
            </div>
          </section>
        ) : null,
      )}

      {!isAuthenticated ? (
        <section className="relative z-10 mt-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[rgba(47,174,126,0.14)] bg-[linear-gradient(145deg,rgba(22,20,18,0.92)_0%,rgba(12,10,9,0.98)_100%)] px-5 py-6 shadow-[0_26px_60px_rgba(0,0,0,0.32)]">
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.10)_0%,rgba(47,174,126,0)_72%)]" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
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
          </div>
        </section>
      ) : null}

      {!hero && !sections.some((section) => section.items.length > 0) ? (
        <PageContainer className="pt-12">
          <EmptyState
            body="Nothing is available in the home feed right now."
            heading="The browse canvas is quiet tonight"
            icon={<PlayCircle aria-hidden="true" className="size-5" />}
          />
        </PageContainer>
      ) : null}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Layers3, PlayCircle, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { dashboardApi } from '../api/dashboardApi'
import { homeApi } from '../api/homeApi'
import { useAuthStore } from '../auth/authStore'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { GenreChip } from '../components/media/GenreChip'
import { HomeReveal } from '../components/media/HomeReveal'
import { MediaRail } from '../components/media/MediaRail'
import { PosterCard } from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { DiscoveryMediaItemDTO } from '../types/api'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'
import { getBackdropUrl } from '../utils/tmdbImages'
import '../styles/editorial.css'

function HomeLoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading your Home feed" className="home-editorial home-loading">
      <div className="home-feature home-wrap" aria-hidden="true">
        <div className="home-feature-art"><Skeleton className="h-full w-full rounded-none" /></div>
        <div className="home-feature-copy">
          <Skeleton className="mb-6 h-4 w-32" />
          <Skeleton className="h-20 w-4/5" /><Skeleton className="mt-3 h-20 w-3/5" />
          <Skeleton className="mt-7 h-4 w-4/5" /><Skeleton className="mt-3 h-4 w-3/5" />
          <div className="mt-8 flex gap-3"><Skeleton className="h-12 w-36" /><Skeleton className="h-12 w-36" /></div>
        </div>
      </div>
      <div className="home-wrap" aria-hidden="true">
        <div className="home-genres">
          <div className="home-genres-intro"><Skeleton className="h-6 w-40" /><Skeleton className="mt-2 h-4 w-36" /></div>
          <div className="home-genre-rows">
            {[0, 1].map((row) => <div className="home-genre-row" key={row}>
              <Skeleton className="mt-3 h-4 w-10" />
              <div className="home-genre-chips home-loading-chips">
                {[48, 66, 52, 100].map((width) => <Skeleton className="h-9" key={width} style={{ width }} />)}
              </div>
            </div>)}
          </div>
        </div>
        {[0, 1].map((section) => (
          <div className="home-shelf" key={section}>
            <Skeleton className="mb-7 h-10 w-64" />
            <div className="flex gap-5 overflow-hidden">
              {[0, 1, 2, 3, 4, 5].map((poster) => <Skeleton className="aspect-[2/3] w-[210px] shrink-0" key={poster} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getHomeHero(homeData: Awaited<ReturnType<typeof homeApi.getHome>>) {
  const sections = [homeData.trendingMovies, homeData.trendingShows, homeData.popularNow, homeData.upcoming]
  return sections.flat().find(Boolean) ?? null
}

function CompactGenreShelf({ movieGenres, onMovieGenre, onShowGenre, showGenres }: {
  movieGenres: string[]
  onMovieGenre: (genre: string) => void
  onShowGenre: (genre: string) => void
  showGenres: string[]
}) {
  const featuredMovieGenres = movieGenres.slice(0, 4)
  const featuredShowGenres = showGenres.slice(0, 4)

  return (
    <div className="home-genres">
      <div className="home-genres-intro"><span>Browse by genre</span></div>
      <div className="home-genre-rows">
        <div className="home-genre-row">
          <p>Movies</p>
          <div className="home-genre-chips">
            <span className="sr-only">Browse movie genres</span>
            {featuredMovieGenres.map((genre) => <GenreChip key={`movie-${genre}`} onClick={() => onMovieGenre(genre)}>{genre}</GenreChip>)}
          </div>
        </div>
        <div className="home-genre-row">
          <p>Shows</p>
          <div className="home-genre-chips">
            {featuredShowGenres.map((genre) => <GenreChip key={`show-${genre}`} onClick={() => onShowGenre(genre)}>{genre}</GenreChip>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))

  const homeQuery = useQuery({ queryFn: homeApi.getHome, queryKey: ['home'] })
  const continueWatchingQuery = useQuery({
    enabled: isAuthenticated,
    queryFn: () => dashboardApi.getContinueWatching(10),
    queryKey: ['dashboard', 'continue-watching', 10],
  })

  if (homeQuery.isLoading) return <HomeLoadingState />

  if (homeQuery.isError || !homeQuery.data) {
    return (
      <div className="home-editorial home-feedback">
        <PageContainer className="pt-10">
          <ErrorState action={<Button onClick={() => homeQuery.refetch()} variant="secondary">Try again</Button>} />
        </PageContainer>
      </div>
    )
  }

  const hero = getHomeHero(homeQuery.data)
  const sections: Array<{ items: DiscoveryMediaItemDTO[]; title: string }> = [
    { items: homeQuery.data.trendingMovies, title: 'Trending Movies' },
    { items: homeQuery.data.trendingShows, title: 'Trending Shows' },
    { items: homeQuery.data.popularNow, title: 'Popular Now' },
    { items: homeQuery.data.airingToday, title: 'Airing Today' },
    { items: homeQuery.data.upcoming, title: 'Upcoming' },
    { items: homeQuery.data.recommendedLater, title: 'Recommended Later' },
  ]
  const continueWatchingItems = continueWatchingQuery.data?.items ?? []

  return (
    <div className="home-editorial">
      {hero ? (
        <section className="home-feature home-wrap" aria-labelledby="home-feature-title">
          <div className="home-feature-art">
            {hero.backdropPath ? <img alt="" className="home-feature-image" key={hero.backdropPath}
              onError={(event) => { event.currentTarget.style.visibility = 'hidden' }}
              src={getBackdropUrl(hero.backdropPath, 'w1280') ?? undefined} /> : null}
            <div className="home-feature-shade" />
          </div>
          <div className="home-feature-copy">
            <p className="home-feature-label"><span /> Featured title</p>
            <div className="home-title-window"><h1 id="home-feature-title">{hero.title}</h1></div>
            <div className="home-feature-meta">
              <span>{formatMediaType(hero.type)}</span>
              {hero.releaseDate ? <span>{hero.releaseDate.slice(0, 4)}</span> : null}
              {typeof hero.rating === 'number' ? <span className="home-feature-rating"><Star aria-hidden="true" className="size-3.5 fill-current" /> {hero.rating.toFixed(1)}</span> : null}
            </div>
            <p className="home-feature-overview">{hero.overview || 'No overview is available for this title.'}</p>
            <div className="home-feature-actions">
              <Link className={getButtonClassName('primary')} to={getMediaRoute(hero.tmdbId, hero.type)}>
                <PlayCircle aria-hidden="true" className="size-4" /> View details <ArrowUpRight aria-hidden="true" className="size-4 home-action-arrow" />
              </Link>
              <Link className={getButtonClassName('secondary')} to="/discover">Explore titles <ArrowRight aria-hidden="true" className="size-4 home-action-arrow" /></Link>
            </div>
          </div>
        </section>
      ) : (
        <PageContainer className="pt-10"><EmptyState body="The home feed is empty right now. Try again in a moment." heading="Nothing to show yet" icon={<Layers3 aria-hidden="true" className="size-5" />} /></PageContainer>
      )}

      <div className="home-wrap">
        <CompactGenreShelf movieGenres={homeQuery.data.movieGenres} showGenres={homeQuery.data.showGenres}
          onMovieGenre={(genre) => navigate(`/discover?genreType=movie&genre=${encodeURIComponent(genre)}`)}
          onShowGenre={(genre) => navigate(`/discover?genreType=show&genre=${encodeURIComponent(genre)}`)} />
      </div>

      {isAuthenticated && continueWatchingItems.length > 0 ? (
        <HomeReveal className="home-shelf home-wrap home-resume">
          <div className="home-shelf-heading"><div><h2>Continue watching</h2></div></div>
          <MediaRail className="home-rail">
            {continueWatchingItems.map((item) => (
              <PosterCard key={`${item.type}-${item.tmdbId}`} href={getMediaRoute(item.tmdbId, item.type)} imagePath={item.posterPath}
                mediaTypeLabel={item.type === 'SHOW' && item.resumeSeasonNumber && item.resumeEpisodeNumber
                  ? `Resume S${item.resumeSeasonNumber} E${item.resumeEpisodeNumber}` : formatMediaType(item.type)}
                presentation="editorial" rating={item.rating} title={item.title} />
            ))}
          </MediaRail>
        </HomeReveal>
      ) : null}

      {sections.map((section, index) => section.items.length > 0 ? (
        <HomeReveal className={`home-shelf home-wrap${index === 2 ? ' home-shelf-featured' : ''}`} key={section.title}>
          <div className="home-shelf-heading">
            <div><h2>{section.title}</h2></div>
            {index < 2 ? <Link className={getButtonClassName('secondary', 'home-explore-link')} to="/discover">
              Explore more <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link> : null}
          </div>
          <MediaRail className="home-rail">
            {section.items.map((item) => (
              <PosterCard key={`${section.title}-${item.tmdbId}`} href={getMediaRoute(item.tmdbId, item.type)} imagePath={item.posterPath}
                mediaTypeLabel={formatMediaType(item.type)} rating={item.rating} releaseDate={item.releaseDate}
                title={item.title} presentation="editorial" />
            ))}
          </MediaRail>
        </HomeReveal>
      ) : null)}

      {!isAuthenticated ? (
        <HomeReveal className="home-join home-wrap">
          <div className="home-join-copy"><p className="home-join-title">Track what you watch.</p>
            <p>Create an account to carry your progress, favourites, and watchlists with you.</p></div>
          <Link className={getButtonClassName('primary')} to="/register">Start tracking <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </HomeReveal>
      ) : null}

      {!hero && !sections.some((section) => section.items.length > 0) ? (
        <PageContainer className="pt-12"><EmptyState body="Nothing is available in the home feed right now." heading="The browse canvas is quiet tonight" icon={<PlayCircle aria-hidden="true" className="size-5" />} /></PageContainer>
      ) : null}
    </div>
  )
}

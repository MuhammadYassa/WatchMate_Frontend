import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import { discoverApi } from '../api/discoverApi'
import { genreApi } from '../api/genreApi'
import { homeApi } from '../api/homeApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { SkeletonPoster, SkeletonText } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { GenreChip } from '../components/media/GenreChip'
import { MediaGrid } from '../components/media/MediaGrid'
import { PosterCard } from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'

const categoryMap = {
  'airing-today': {
    label: 'Airing Today',
    queryFn: discoverApi.getAiringToday,
  },
  'popular-now': {
    label: 'Popular Now',
    queryFn: discoverApi.getPopularNow,
  },
  'recommended-later': {
    label: 'Recommended Later',
    queryFn: discoverApi.getRecommendedLater,
  },
  'trending-movies': {
    label: 'Trending Movies',
    queryFn: discoverApi.getTrendingMovies,
  },
  'trending-shows': {
    label: 'Trending Shows',
    queryFn: discoverApi.getTrendingShows,
  },
  upcoming: {
    label: 'Upcoming',
    queryFn: discoverApi.getUpcoming,
  },
} as const

type CategoryId = keyof typeof categoryMap

function isCategoryId(value: string | null): value is CategoryId {
  return value !== null && value in categoryMap
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

function PosterGridSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonText />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SkeletonPoster />
        <SkeletonPoster />
        <SkeletonPoster />
        <SkeletonPoster />
        <SkeletonPoster />
      </div>
    </div>
  )
}

export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const selectedCategory: CategoryId = isCategoryId(categoryParam)
    ? categoryParam
    : 'trending-movies'
  const selectedGenre = searchParams.get('genre')
  const selectedGenreType = searchParams.get('genreType') === 'show' ? 'show' : 'movie'

  const genresQuery = useQuery({
    queryFn: homeApi.getHome,
    queryKey: ['discover', 'genres'],
  })

  const categoryQuery = useQuery({
    queryFn: categoryMap[selectedCategory].queryFn,
    queryKey: ['discover-category', selectedCategory],
  })

  const genreQuery = useQuery({
    enabled: Boolean(selectedGenre),
    queryFn: () =>
      selectedGenreType === 'movie'
        ? genreApi.getGenreMovies(selectedGenre ?? '')
        : genreApi.getGenreShows(selectedGenre ?? ''),
    queryKey: ['discover-genre', selectedGenreType, selectedGenre],
  })

  const movieGenres = genresQuery.data?.movieGenres ?? []
  const showGenres = genresQuery.data?.showGenres ?? []
  const genreResults = genreQuery.data?.results ?? []

  const currentCategoryLabel = useMemo(
    () => categoryMap[selectedCategory].label,
    [selectedCategory],
  )

  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:space-y-12 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.97)_100%)] px-5 py-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] md:px-8 md:py-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(173,198,255,0.12)_0%,rgba(173,198,255,0)_72%)]" />
        <div className="relative space-y-5">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Discover
            </p>
            <h1 className="max-w-3xl font-display text-5xl tracking-[-0.05em] text-white md:text-6xl">
              Browse what's moving right now.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Move through the supported WatchMate categories, then pivot into genre browsing
              when you want something more specific.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(categoryMap) as CategoryId[]).map((category) => (
              <GenreChip
                active={category === selectedCategory}
                key={category}
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams)
                  nextParams.set('category', category)
                  setSearchParams(nextParams, { replace: true })
                }}
              >
                {categoryMap[category].label}
              </GenreChip>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 space-y-5">
        <SectionHeader eyebrow="Category" title={currentCategoryLabel} />
        {categoryQuery.isLoading ? (
          <PosterGridSkeleton />
        ) : categoryQuery.isError ? (
          <ErrorState
            action={
              <Button onClick={() => categoryQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
          />
        ) : categoryQuery.data && categoryQuery.data.length > 0 ? (
          <MediaGrid>
            {categoryQuery.data.map((item) => (
              <PosterCard
                key={`${selectedCategory}-${item.tmdbId}`}
                href={getMediaRoute(item.tmdbId, item.type)}
                imagePath={item.posterPath}
                mediaTypeLabel={formatMediaType(item.type)}
                rating={item.rating}
                releaseDate={item.releaseDate}
                title={item.title}
              />
            ))}
          </MediaGrid>
        ) : (
          <EmptyState
            body="There isn't anything in this category right now."
            heading="Nothing to show yet"
            icon={<span className="text-lg">+</span>}
          />
        )}
      </section>

      <section className="relative z-10 grid gap-6 lg:grid-cols-2">
        <GenrePanel title="Movie genres">
          {movieGenres.map((genre) => (
            <GenreChip
              active={selectedGenreType === 'movie' && selectedGenre === genre}
              key={genre}
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams)
                nextParams.set('genre', genre)
                nextParams.set('genreType', 'movie')
                setSearchParams(nextParams, { replace: true })
              }}
            >
              {genre}
            </GenreChip>
          ))}
        </GenrePanel>
        <GenrePanel title="Show genres">
          {showGenres.map((genre) => (
            <GenreChip
              active={selectedGenreType === 'show' && selectedGenre === genre}
              key={genre}
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams)
                nextParams.set('genre', genre)
                nextParams.set('genreType', 'show')
                setSearchParams(nextParams, { replace: true })
              }}
            >
              {genre}
            </GenreChip>
          ))}
        </GenrePanel>
      </section>

      {selectedGenre ? (
        <section className="relative z-10 space-y-5">
          <SectionHeader
            action={
              <Button
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams)
                  nextParams.delete('genre')
                  nextParams.delete('genreType')
                  setSearchParams(nextParams, { replace: true })
                }}
                variant="ghost"
              >
                Clear genre
              </Button>
            }
            eyebrow="Genre browse"
            title={`${selectedGenre} ${selectedGenreType === 'movie' ? 'movies' : 'shows'}`}
          />
          {genreQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <SkeletonPoster />
              <SkeletonPoster />
              <SkeletonPoster />
              <SkeletonPoster />
              <SkeletonPoster />
            </div>
          ) : genreQuery.isError ? (
            <ErrorState
              action={
                <Button onClick={() => genreQuery.refetch()} variant="secondary">
                  Try again
                </Button>
              }
            />
          ) : genreResults.length > 0 ? (
            <MediaGrid>
              {genreResults.map((item) => (
                <PosterCard
                  key={`${selectedGenreType}-${selectedGenre}-${item.tmdbId}`}
                  href={getMediaRoute(item.tmdbId, item.type)}
                  imagePath={item.posterPath}
                  mediaTypeLabel={formatMediaType(item.type)}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  title={item.title}
                />
              ))}
            </MediaGrid>
          ) : (
            <EmptyState
              body="Nothing matches that genre right now. Try another one."
              heading="No titles in this genre"
              icon={<span className="text-lg">+</span>}
            />
          )}
        </section>
      ) : null}
    </PageContainer>
  )
}

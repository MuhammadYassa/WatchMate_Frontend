import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'

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
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { DiscoveryMediaItemDTO } from '../types/api'
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
    <div className="overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(18,19,23,0.86)_0%,rgba(10,11,15,0.96)_100%)] px-5 py-5 shadow-[0_22px_58px_rgba(0,0,0,0.24)] md:px-6 md:py-6">
      <div className="space-y-4">
        <SectionHeader title={title} />
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

function DiscoverFeatureCard({ item }: { item: DiscoveryMediaItemDTO | null }) {
  if (!item) {
    return (
      <div className="motion-scale-in relative overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(18,19,23,0.86)_0%,rgba(10,11,15,0.96)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
        <div className="space-y-4">
          <h2 className="font-display text-3xl tracking-[-0.04em] text-white md:text-4xl">
            Queue up the next thing worth watching.
          </h2>
          <p className="max-w-lg text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Browse the supported WatchMate categories or pivot into genre shelves for something
            more specific.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="motion-scale-in relative overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(18,19,23,0.86)_0%,rgba(10,11,15,0.96)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.12)_0%,rgba(47,174,126,0)_74%)]" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-3">
            <h2 className="font-display text-3xl tracking-[-0.04em] text-white md:text-4xl">
              {item.title}
            </h2>
            <p className="line-clamp-4 max-w-xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
              {item.overview || 'No overview is available for this title yet.'}
            </p>
          </div>
          <p className="text-[12px] text-[color:var(--color-text-tertiary)]">
            {[formatMediaType(item.type), item.releaseDate?.slice(0, 4), typeof item.rating === 'number' ? `${item.rating.toFixed(1)} rating` : null].filter(Boolean).join(' Â· ')}
          </p>
        </div>
        <Link className={getButtonClassName('secondary', 'shrink-0')} to={getMediaRoute(item.tmdbId, item.type)}>
          Open title
        </Link>
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
  const featuredItem = categoryQuery.data?.[0] ?? null

  return (
    <PageContainer className="relative isolate space-y-12 overflow-hidden pt-8 md:space-y-14 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 space-y-8 overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(10,11,14,0.98)_100%)] px-5 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.14)_0%,rgba(47,174,126,0)_72%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.82fr)] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-5xl tracking-[-0.03em] text-white md:text-6xl xl:text-[5.2rem]">
                Browse what&apos;s moving right now.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
                Shift between the supported WatchMate shelves, then narrow the canvas with genre
                browsing when you want a specific mood.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 border-b border-white/10 pb-1">
              {(Object.keys(categoryMap) as CategoryId[]).map((category) => (
                <button
                  className={`border-b pb-3 text-left text-[11px] uppercase tracking-[0.28em] transition ${
                    category === selectedCategory
                      ? 'border-[color:var(--color-accent)] text-white'
                      : 'border-transparent text-[color:var(--color-text-tertiary)] hover:text-white'
                  }`}
                  key={category}
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams)
                    nextParams.set('category', category)
                    setSearchParams(nextParams, { replace: true })
                  }}
                  type="button"
                >
                  {categoryMap[category].label}
                </button>
              ))}
            </div>
          </div>
          <DiscoverFeatureCard item={featuredItem} />
        </div>
      </section>

      <section className="relative z-10 space-y-6">
        <SectionHeader title={currentCategoryLabel} />
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
          <MediaGrid className="gap-x-4 gap-y-8 sm:gap-x-5 xl:grid-cols-6">
            {categoryQuery.data.map((item) => (
              <PosterCard
                key={`${selectedCategory}-${item.tmdbId}`}
                href={getMediaRoute(item.tmdbId, item.type)}
                imagePath={item.posterPath}
                mediaTypeLabel={formatMediaType(item.type)}
                rating={item.rating}
                releaseDate={item.releaseDate}
                title={item.title}
                variant="grid"
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
        <section className="relative z-10 space-y-6">
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
            <MediaGrid className="gap-x-4 gap-y-8 sm:gap-x-5 xl:grid-cols-6">
              {genreResults.map((item) => (
                <PosterCard
                  key={`${selectedGenreType}-${selectedGenre}-${item.tmdbId}`}
                  href={getMediaRoute(item.tmdbId, item.type)}
                  imagePath={item.posterPath}
                  mediaTypeLabel={formatMediaType(item.type)}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  title={item.title}
                  variant="grid"
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

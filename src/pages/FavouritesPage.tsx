import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Search, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { favouriteApi } from '../api/favouriteApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { MediaGrid } from '../components/media/MediaGrid'
import { PosterCard } from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { MediaDetailsDTO, PageResponse } from '../types/api'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'

const PAGE_SIZE = 20

function FavouritesLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-[220px] rounded-[var(--radius-panel)]" />
      <div className="relative z-10">
        <MediaGrid className="gap-x-4 gap-y-8 sm:gap-x-5 xl:grid-cols-6">
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
        </MediaGrid>
      </div>
    </PageContainer>
  )
}

export function FavouritesPage() {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const favouritesQuery = useQuery({
    queryFn: () => favouriteApi.getFavourites(page, PAGE_SIZE),
    queryKey: ['favourites', page, PAGE_SIZE],
  })

  const removeFavouriteMutation = useMutation({
    mutationFn: (item: MediaDetailsDTO) => favouriteApi.removeFavourite(item.tmdbId),
    onSuccess: async (_, item) => {
      queryClient.setQueryData<PageResponse<MediaDetailsDTO>>(
        ['favourites', page, PAGE_SIZE],
        (current) => {
          if (!current) {
            return current
          }

          const nextFavourites = current.content.filter(
            (entry) => !(entry.tmdbId === item.tmdbId && entry.type === item.type),
          )

          return {
            ...current,
            content: nextFavourites,
            empty: nextFavourites.length === 0,
            numberOfElements: nextFavourites.length,
            totalElements: Math.max(0, current.totalElements - 1),
            totalPages: Math.max(0, Math.ceil(Math.max(0, current.totalElements - 1) / current.size)),
          }
        },
      )

      pushToast('Removed from favourites.', 'success')

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['favourites'] }),
        queryClient.invalidateQueries({
          queryKey: item.type === 'MOVIE' ? ['movie-details', item.tmdbId] : ['show-details', item.tmdbId],
        }),
        queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
      ])
    },
  })

  if (favouritesQuery.isLoading) {
    return <FavouritesLoadingState />
  }

  if (favouritesQuery.isError || !favouritesQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => favouritesQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            body="We couldn't load your favourites right now."
            heading="Your favourites shelf is taking a beat"
          />
        </div>
      </PageContainer>
    )
  }

  const favourites = favouritesQuery.data.content
  const favouritePage = favouritesQuery.data

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] px-6 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.36)] md:px-8 md:py-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,174,126,0.14)_0%,rgba(47,174,126,0)_32%),linear-gradient(145deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative z-10 space-y-4">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            Library
          </p>
          <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.03em] text-white md:text-6xl xl:text-[4.75rem]">
            Your favourites, all in one place.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
            Keep the titles you love close, and jump back into any movie or show from one clean,
            uninterrupted shelf.
          </p>
          <p className="text-sm text-[color:var(--color-text-tertiary)]">
            {favouritePage.totalElements} saved {favouritePage.totalElements === 1 ? 'favourite' : 'favourites'}
          </p>
        </div>
      </section>

      {favourites.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            action={
              <div className="flex flex-wrap gap-3">
                <Link className={getButtonClassName('primary')} to="/discover">
                  <Sparkles aria-hidden="true" className="mr-2 size-4" />
                  Explore picks
                </Link>
                <Link className={getButtonClassName('secondary')} to="/search">
                  <Search aria-hidden="true" className="mr-2 size-4" />
                  Search titles
                </Link>
              </div>
            }
            body="Heart a movie or show from any detail page and it will land here for quick access later."
            heading="No favourites yet"
            icon={<Heart aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : (
        <section className="relative z-10 space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                Saved now
              </p>
              <h2 className="font-display text-3xl tracking-[-0.04em] text-white md:text-5xl">
                Your current shelf
              </h2>
            </div>
            <Pagination
              className="w-auto justify-start"
              onPageChange={setPage}
              page={page}
              totalPages={favouritePage.totalPages}
            />
          </div>
          <MediaGrid className="gap-x-4 gap-y-8 sm:gap-x-5 xl:grid-cols-6">
            {favourites.map((item, index) => (
              <div
                className="group relative space-y-3"
                key={`${item.type}-${item.tmdbId}`}
                style={{ animationDelay: `${Math.min(index * 35, 220)}ms` }}
              >
                <Button
                  className="absolute right-3 top-3 z-20 min-h-0 rounded-full border border-white/10 bg-[rgba(8,9,12,0.72)] px-2.5 py-2 text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 group-hover:opacity-100"
                  disabled={removeFavouriteMutation.isPending}
                  onClick={() => removeFavouriteMutation.mutate(item)}
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  <span className="sr-only">Remove favourite</span>
                </Button>
                <PosterCard
                  className="motion-slide-up"
                  href={getMediaRoute(item.tmdbId, item.type)}
                  imagePath={item.posterPath}
                  mediaTypeLabel={formatMediaType(item.type)}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  title={item.title}
                  variant="grid"
                />
              </div>
            ))}
          </MediaGrid>
        </section>
      )}
    </PageContainer>
  )
}

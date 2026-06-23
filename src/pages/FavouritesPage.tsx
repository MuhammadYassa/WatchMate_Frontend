import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { favouriteApi } from '../api/favouriteApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { MediaGrid } from '../components/media/MediaGrid'
import { PosterCard } from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { MediaDetailsDTO, UserFavouritesDTO } from '../types/api'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'

function FavouritesLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-[260px] rounded-[36px]" />
      <div className="relative z-10">
        <MediaGrid>
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
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const favouritesQuery = useQuery({
    queryFn: favouriteApi.getAll,
    queryKey: ['favourites'],
  })

  const removeFavouriteMutation = useMutation({
    mutationFn: (item: MediaDetailsDTO) => favouriteApi.removeFavourite(item.tmdbId, item.type),
    onSuccess: async (_, item) => {
      queryClient.setQueryData<UserFavouritesDTO>(['favourites'], (current) => {
        if (!current) {
          return current
        }

        const nextFavourites = current.favourites.filter(
          (entry) => !(entry.tmdbId === item.tmdbId && entry.type === item.type),
        )

        return {
          favourites: nextFavourites,
          totalCount: nextFavourites.length,
        }
      })

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

  const favourites = favouritesQuery.data.favourites

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <Card className="relative z-10 overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.97)_100%)] p-0 shadow-[0_30px_80px_rgba(0,0,0,0.36)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.15)_0%,rgba(173,198,255,0)_34%),linear-gradient(145deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative z-10 space-y-4 p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            Library
          </p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.05em] text-white md:text-6xl">
            Your favourites, all in one place.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
            Keep the titles you love close, and jump back into any movie or show from one clean shelf.
          </p>
          <p className="text-sm text-[color:var(--color-text-tertiary)]">
            {favouritesQuery.data.totalCount} saved {favouritesQuery.data.totalCount === 1 ? 'favourite' : 'favourites'}
          </p>
        </div>
      </Card>

      {favourites.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            action={
              <div className="flex flex-wrap gap-3">
                <Link className="inline-flex min-h-11 items-center rounded-2xl bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[#122f5f] transition hover:bg-[color:var(--color-accent-strong)]" to="/discover">
                  <Sparkles aria-hidden="true" className="mr-2 size-4" />
                  Explore picks
                </Link>
                <Link className="inline-flex min-h-11 items-center rounded-2xl border border-white/10 px-5 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:border-white/18 hover:bg-[rgba(255,255,255,0.08)] hover:text-white" to="/search">
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
          <SectionHeader eyebrow="Saved now" title="Your current shelf" />
          <MediaGrid className="gap-5">
            {favourites.map((item) => (
              <Card
                className="space-y-4 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-4"
                key={`${item.type}-${item.tmdbId}`}
              >
                <PosterCard
                  href={getMediaRoute(item.tmdbId, item.type)}
                  imagePath={item.posterPath}
                  mediaTypeLabel={formatMediaType(item.type)}
                  rating={item.rating}
                  releaseDate={item.releaseDate}
                  title={item.title}
                />
                <Button
                  disabled={removeFavouriteMutation.isPending}
                  onClick={() => removeFavouriteMutation.mutate(item)}
                  variant="ghost"
                >
                  Remove favourite
                </Button>
              </Card>
            ))}
          </MediaGrid>
        </section>
      )}
    </PageContainer>
  )
}

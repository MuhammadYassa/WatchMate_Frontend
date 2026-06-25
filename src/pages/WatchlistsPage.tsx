import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronUp,
  Film,
  Heart,
  PencilLine,
  Plus,
  Rows3,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { watchlistApi } from '../api/watchlistApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { MediaGrid } from '../components/media/MediaGrid'
import { PosterCard } from '../components/media/PosterCard'
import { PosterPlaceholder } from '../components/media/PosterPlaceholder'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { SpringPage, WatchListDTO } from '../types/api'
import { ApiClientError } from '../types/errors'
import { formatMediaType } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'
import { getPosterUrl, hasImagePath } from '../utils/tmdbImages'

const PAGE_SIZE = 20

function getWatchlistNameError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.code === 'WATCHLIST_NAME_CONFLICT') {
      return 'That watchlist name is already in use. Try another one.'
    }

    return error.message
  }

  return null
}

function WatchlistsLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-[260px] rounded-[28px]" />
      {[0, 1, 2].map((item) => (
        <Card
          className="relative z-10 space-y-6 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] p-6"
          key={item}
        >
          <Skeleton className="h-8 w-48 rounded-[14px]" />
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Skeleton className="h-[210px] rounded-[20px]" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-64 rounded-[14px]" />
              <Skeleton className="h-20 w-full rounded-[18px]" />
              <div className="flex gap-4">
                <SkeletonPoster />
                <SkeletonPoster />
                <SkeletonPoster />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </PageContainer>
  )
}

function WatchlistPosterPreview({ watchlist }: { watchlist: WatchListDTO }) {
  const previewItems = watchlist.media.slice(0, 3)

  if (!previewItems.length) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-[22px] border border-dashed border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <PosterPlaceholder className="max-w-[150px]" title={watchlist.name} />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.94)_0%,rgba(11,12,16,0.98)_100%)] px-6 py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(173,198,255,0.12)_0%,rgba(173,198,255,0)_58%)]" />
      {previewItems.map((item, index) => {
        const rotation = index === 0 ? '-rotate-6 -translate-x-10' : index === 2 ? 'rotate-6 translate-x-10' : 'z-10 -translate-y-2'

        return hasImagePath(item.posterPath) ? (
          <img
            key={`${item.type}-${item.tmdbId}`}
            alt=""
            className={`poster-stack-item absolute h-[178px] w-[118px] rounded-[16px] border border-white/10 object-cover shadow-[0_22px_50px_rgba(0,0,0,0.34)] transition duration-300 ${rotation}`}
            src={getPosterUrl(item.posterPath, 'w342') ?? undefined}
          />
        ) : (
          <PosterPlaceholder
            key={`${item.type}-${item.tmdbId}`}
            className={`poster-stack-item absolute h-[178px] w-[118px] ${rotation}`}
            title={item.title}
          />
        )
      })}
    </div>
  )
}

function WatchlistEditorDialog({
  error,
  initialValue,
  onClose,
  onSubmit,
  open,
  pending,
  submitLabel,
  title,
}: {
  error: string | null
  initialValue: string
  onClose: () => void
  onSubmit: (value: string) => void
  open: boolean
  pending: boolean
  submitLabel: string
  title: string
}) {
  const [value, setValue] = useState(initialValue)

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[rgba(5,6,8,0.82)] px-4 py-4 backdrop-blur-md sm:items-center sm:py-8">
      <Card className="motion-modal w-full max-w-xl space-y-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(18,19,23,0.94)_0%,rgba(10,11,15,0.98)_100%)] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(173,198,255,0.32)_50%,rgba(255,255,255,0)_100%)]" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Watchlists
            </p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-white">{title}</h2>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Keep it short and easy to scan across your library.
            </p>
          </div>
          <Button aria-label="Close watchlist editor" onClick={onClose} variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <FormField
          error={error}
          hint="Names like Friday night, Comfort rewatches, or Summer shows work well."
          label="Watchlist name"
        >
          <Input
            autoFocus
            className="bg-[rgba(10,12,16,0.82)]"
            disabled={pending}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Weekend picks"
            value={value}
          />
        </FormField>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" disabled={pending} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={pending || value.trim().length < 2}
            onClick={() => onSubmit(value.trim())}
          >
            {submitLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function WatchlistsPage() {
  const [page, setPage] = useState(0)
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameWatchlist, setRenameWatchlist] = useState<WatchListDTO | null>(null)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const listQueryKey = ['watchlists', page, PAGE_SIZE] as const

  const watchlistsQuery = useQuery({
    queryFn: () => watchlistApi.getWatchlists(page, PAGE_SIZE),
    queryKey: listQueryKey,
  })

  function updateVisiblePage(
    updater: (current: SpringPage<WatchListDTO>) => SpringPage<WatchListDTO>,
  ) {
    queryClient.setQueryData<SpringPage<WatchListDTO>>(listQueryKey, (current) => {
      if (!current) {
        return current
      }

      return updater(current)
    })
  }

  const createMutation = useMutation({
    mutationFn: (name: string) => watchlistApi.createWatchlist({ name }),
    onSuccess: async (createdWatchlist) => {
      setCreateDialogOpen(false)
      setExpandedIds((current) => Array.from(new Set([createdWatchlist.id, ...current])))
      updateVisiblePage((current) => ({
        ...current,
        content: page === 0 ? [createdWatchlist, ...current.content].slice(0, PAGE_SIZE) : current.content,
        empty: false,
        numberOfElements: page === 0 ? Math.min(current.numberOfElements + 1, PAGE_SIZE) : current.numberOfElements,
        totalElements: current.totalElements + 1,
        totalPages: Math.max(current.totalPages, 1),
      }))
      pushToast('Watchlist created.', 'success')
      await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      watchlistApi.renameWatchlist(id, { newName: name }),
    onSuccess: async (updatedWatchlist) => {
      setRenameWatchlist(null)
      updateVisiblePage((current) => ({
        ...current,
        content: current.content.map((watchlist) =>
          watchlist.id === updatedWatchlist.id ? updatedWatchlist : watchlist,
        ),
      }))
      pushToast('Watchlist renamed.', 'success')
      await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => watchlistApi.deleteWatchlist(id),
    onSuccess: async (_, deletedId) => {
      setDeleteConfirmId(null)
      setExpandedIds((current) => current.filter((id) => id !== deletedId))
      updateVisiblePage((current) => {
        const nextContent = current.content.filter((watchlist) => watchlist.id !== deletedId)

        return {
          ...current,
          content: nextContent,
          empty: nextContent.length === 0,
          numberOfElements: Math.max(current.numberOfElements - 1, 0),
          totalElements: Math.max(current.totalElements - 1, 0),
        }
      })
      pushToast('Watchlist deleted.', 'success')
      await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (input: { tmdbId: number; type: 'MOVIE' | 'SHOW'; watchlistId: number }) =>
      watchlistApi.removeItem(input.watchlistId, input.tmdbId, input.type),
    onSuccess: async (updatedWatchlist, variables) => {
      updateVisiblePage((current) => ({
        ...current,
        content: current.content.map((watchlist) =>
          watchlist.id === updatedWatchlist.id ? updatedWatchlist : watchlist,
        ),
      }))
      pushToast('Removed from watchlist.', 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watchlists'] }),
        queryClient.invalidateQueries({
          queryKey:
            variables.type === 'MOVIE'
              ? ['movie-details', variables.tmdbId]
              : ['show-details', variables.tmdbId],
        }),
      ])
    },
  })

  if (watchlistsQuery.isLoading) {
    return <WatchlistsLoadingState />
  }

  if (watchlistsQuery.isError || !watchlistsQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => watchlistsQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            body="We couldn't load your watchlists right now."
            heading="Your library is taking a moment"
          />
        </div>
      </PageContainer>
    )
  }

  const watchlistsPage = watchlistsQuery.data
  const watchlists = watchlistsPage.content
  const createError = getWatchlistNameError(createMutation.error)
  const renameError = getWatchlistNameError(renameMutation.error)

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] px-6 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.36)] md:px-8 md:py-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.15)_0%,rgba(173,198,255,0)_34%),linear-gradient(145deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Library
            </p>
            <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.055em] text-white md:text-6xl xl:text-[4.75rem]">
              Your watchlists, ready to browse.
            </h1>
            <p className="text-base leading-7 text-[color:var(--color-text-secondary)]">
              Build collections around moods, nights in, rewatches, and whatever you want queued
              up next.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus aria-hidden="true" className="mr-2 size-4" />
              New watchlist
            </Button>
            <Link className={getButtonClassName('secondary')} to="/favourites">
              <Heart aria-hidden="true" className="mr-2 size-4" />
              View favourites
            </Link>
          </div>
        </div>
      </section>

      {watchlists.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            action={
              <div className="flex flex-wrap gap-3">
                <Link className={getButtonClassName('primary')} to="/search">
                  Search titles
                </Link>
                <Link className={getButtonClassName('secondary')} to="/discover">
                  Explore picks
                </Link>
              </div>
            }
            body="Create a first list for the titles you want to revisit, queue for later, or keep grouped by vibe."
            heading="No watchlists yet"
            icon={<Rows3 aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : (
        <div className="relative z-10 grid gap-6">
          {watchlists.map((watchlist, index) => {
            const expanded = expandedIds.includes(watchlist.id)
            const deleting = deleteMutation.isPending && deleteConfirmId === watchlist.id

            return (
              <Card
                className="overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] md:p-6"
                key={watchlist.id}
              >
                <div
                  className="motion-slide-up space-y-6"
                  style={{ animationDelay: `${Math.min(index * 55, 220)}ms` }}
                >
                  <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                    <WatchlistPosterPreview watchlist={watchlist} />

                    <div className="space-y-5 self-center">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                            Watchlist
                          </p>
                          <h2 className="font-display text-4xl tracking-[-0.045em] text-white">
                            {watchlist.name}
                          </h2>
                          <p className="text-sm text-[color:var(--color-text-tertiary)]">
                            {watchlist.media.length} saved {watchlist.media.length === 1 ? 'title' : 'titles'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button onClick={() => setRenameWatchlist(watchlist)} variant="ghost">
                            <PencilLine aria-hidden="true" className="mr-2 size-4" />
                            Rename
                          </Button>
                          {deleteConfirmId === watchlist.id ? (
                            <>
                              <Button disabled={deleting} onClick={() => setDeleteConfirmId(null)} variant="ghost">
                                Cancel
                              </Button>
                              <Button
                                disabled={deleting}
                                onClick={() => deleteMutation.mutate(watchlist.id)}
                                variant="secondary"
                              >
                                <Trash2 aria-hidden="true" className="mr-2 size-4" />
                                Confirm delete
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => setDeleteConfirmId(watchlist.id)} variant="ghost">
                              <Trash2 aria-hidden="true" className="mr-2 size-4" />
                              Delete
                            </Button>
                          )}
                          <Button
                            onClick={() =>
                              setExpandedIds((current) =>
                                expanded
                                  ? current.filter((id) => id !== watchlist.id)
                                  : [...current, watchlist.id],
                              )
                            }
                            variant="secondary"
                          >
                            {expanded ? (
                              <ChevronUp aria-hidden="true" className="mr-2 size-4" />
                            ) : (
                              <ChevronDown aria-hidden="true" className="mr-2 size-4" />
                            )}
                            {expanded ? 'Hide titles' : 'Open list'}
                          </Button>
                        </div>
                      </div>

                      <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                        Open the list to browse every saved title and remove anything you no longer
                        want in rotation.
                      </p>
                    </div>
                  </div>

                  {expanded ? (
                    watchlist.media.length > 0 ? (
                      <div className="space-y-5 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.025)] p-5">
                        <SectionHeader eyebrow="Saved titles" title="Inside this collection" />
                        <MediaGrid className="gap-x-4 gap-y-8 sm:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6">
                          {watchlist.media.map((item) => (
                            <div className="space-y-3" key={`${watchlist.id}-${item.type}-${item.tmdbId}`}>
                              <PosterCard
                                href={getMediaRoute(item.tmdbId, item.type)}
                                imagePath={item.posterPath}
                                mediaTypeLabel={formatMediaType(item.type)}
                                rating={item.rating}
                                releaseDate={item.releaseDate}
                                title={item.title}
                                variant="grid"
                              />
                              <Button
                                className="w-full"
                                disabled={removeItemMutation.isPending}
                                onClick={() =>
                                  removeItemMutation.mutate({
                                    tmdbId: item.tmdbId,
                                    type: item.type,
                                    watchlistId: watchlist.id,
                                  })
                                }
                                variant="ghost"
                              >
                                Remove from list
                              </Button>
                            </div>
                          ))}
                        </MediaGrid>
                      </div>
                    ) : (
                      <EmptyState
                        body="This watchlist is ready for its first title. Add from search, discover, or any detail page."
                        heading="Nothing saved here yet"
                        icon={<Film aria-hidden="true" className="size-5" />}
                      />
                    )
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {watchlistsPage.totalPages > 1 ? (
        <Card className="relative z-10 flex flex-wrap items-center justify-between gap-3 overflow-hidden border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-4">
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Page {watchlistsPage.number + 1} of {watchlistsPage.totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              disabled={watchlistsPage.first}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              variant="ghost"
            >
              Previous
            </Button>
            <Button
              disabled={watchlistsPage.last}
              onClick={() => setPage((current) => current + 1)}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </Card>
      ) : null}

      <WatchlistEditorDialog
        error={createError}
        initialValue=""
        key={createDialogOpen ? 'create-open' : 'create-closed'}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={(value) => createMutation.mutate(value)}
        open={createDialogOpen}
        pending={createMutation.isPending}
        submitLabel="Create watchlist"
        title="Create a new watchlist"
      />

      <WatchlistEditorDialog
        error={renameError}
        initialValue={renameWatchlist?.name ?? ''}
        key={renameWatchlist ? `rename-${renameWatchlist.id}-${renameWatchlist.name}` : 'rename-closed'}
        onClose={() => setRenameWatchlist(null)}
        onSubmit={(value) => {
          if (!renameWatchlist) {
            return
          }

          renameMutation.mutate({ id: renameWatchlist.id, name: value })
        }}
        open={renameWatchlist !== null}
        pending={renameMutation.isPending}
        submitLabel="Save name"
        title="Rename watchlist"
      />
    </PageContainer>
  )
}

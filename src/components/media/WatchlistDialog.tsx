import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ListPlus, Plus, X } from 'lucide-react'
import { useState } from 'react'

import { watchlistApi } from '../../api/watchlistApi'
import type { MediaType } from '../../types/enums'
import { ApiClientError } from '../../types/errors'
import { useToast } from '../feedback/toastContext'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormField } from '../ui/FormField'
import { Input } from '../ui/Input'

interface WatchlistDialogProps {
  mediaType: MediaType
  onClose: () => void
  open: boolean
  title: string
  tmdbId: number
}

function includesMedia(
  watchlistMedia: Array<{ tmdbId: number; type: MediaType }>,
  tmdbId: number,
  mediaType: MediaType,
) {
  return watchlistMedia.some((item) => item.tmdbId === tmdbId && item.type === mediaType)
}

export function WatchlistDialog({
  mediaType,
  onClose,
  open,
  title,
  tmdbId,
}: WatchlistDialogProps) {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const [newWatchlistName, setNewWatchlistName] = useState('')

  const watchlistsQuery = useQuery({
    enabled: open,
    queryFn: () => watchlistApi.getWatchlists(0, 50),
    queryKey: ['watchlists', 'dialog'],
  })

  const createWatchlistMutation = useMutation({
    mutationFn: watchlistApi.createWatchlist,
    onSuccess: async () => {
      setNewWatchlistName('')
      pushToast('Watchlist created. Add your title from the list below.', 'success')
      await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })

  const addMutation = useMutation({
    mutationFn: (watchlistId: number) => watchlistApi.addItem(watchlistId, tmdbId, mediaType),
    onSuccess: async () => {
      pushToast('Added to watchlist.', 'success')
      await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (watchlistId: number) => watchlistApi.removeItem(watchlistId, tmdbId, mediaType),
    onSuccess: async () => {
      pushToast('Removed from watchlist.', 'success')
      await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    },
  })

  if (!open) {
    return null
  }

  const watchlists = watchlistsQuery.data?.content ?? []
  const createError = createWatchlistMutation.error instanceof ApiClientError
    ? createWatchlistMutation.error.message
    : null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[rgba(5,6,8,0.82)] px-4 py-4 backdrop-blur-md sm:items-center sm:py-8">
      <Card className="w-full max-w-3xl space-y-6 border-white/10 bg-[linear-gradient(145deg,rgba(18,19,23,0.94)_0%,rgba(10,11,15,0.98)_100%)] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Watchlists
            </p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-white">Organize {title}</h2>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Add this title to an existing watchlist or create a new one first.
            </p>
          </div>
          <Button aria-label="Close watchlist dialog" onClick={onClose} variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <Card className="space-y-4 border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <FormField
            error={createError}
            hint="Keep names short and easy to scan."
            label="Create a new watchlist"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                className="bg-[rgba(10,12,16,0.82)]"
                onChange={(event) => setNewWatchlistName(event.target.value)}
                placeholder="Weekend movies"
                value={newWatchlistName}
              />
              <Button
                disabled={createWatchlistMutation.isPending || newWatchlistName.trim().length < 2}
                onClick={() => {
                  createWatchlistMutation.mutate({ name: newWatchlistName.trim() })
                }}
                variant="secondary"
              >
                <Plus aria-hidden="true" className="mr-2 size-4" />
                Create
              </Button>
            </div>
          </FormField>
        </Card>

        <div className="max-h-[calc(100dvh-15rem)] space-y-3 overflow-y-auto pr-1">
          {watchlistsQuery.isLoading ? (
            <p className="text-sm text-[color:var(--color-text-tertiary)]">Loading your watchlists...</p>
          ) : watchlists.length > 0 ? (
            watchlists.map((watchlist) => {
              const alreadyAdded = includesMedia(watchlist.media, tmdbId, mediaType)

              return (
                <Card
                  className="flex flex-col gap-4 border-white/10 bg-[rgba(255,255,255,0.03)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={watchlist.id}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{watchlist.name}</p>
                    <p className="text-xs text-[color:var(--color-text-tertiary)]">
                      {watchlist.media.length} saved {watchlist.media.length === 1 ? 'title' : 'titles'}
                    </p>
                  </div>
                  <Button
                    disabled={addMutation.isPending || removeMutation.isPending}
                    onClick={() => {
                      if (alreadyAdded) {
                        removeMutation.mutate(watchlist.id)
                        return
                      }

                      addMutation.mutate(watchlist.id)
                    }}
                    variant={alreadyAdded ? 'primary' : 'secondary'}
                  >
                    {alreadyAdded ? (
                      <>
                        <Check aria-hidden="true" className="mr-2 size-4" />
                        In watchlist
                      </>
                    ) : (
                      <>
                        <ListPlus aria-hidden="true" className="mr-2 size-4" />
                        Add title
                      </>
                    )}
                  </Button>
                </Card>
              )
            })
          ) : (
            <p className="text-sm text-[color:var(--color-text-tertiary)]">
              You do not have any watchlists yet. Create one to start organizing titles.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

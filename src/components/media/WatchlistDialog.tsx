import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ListPlus, Plus, X } from 'lucide-react'
import { useState } from 'react'

import { watchlistApi } from '../../api/watchlistApi'
import type { MediaType } from '../../types/enums'
import { ApiClientError } from '../../types/errors'
import { useToast } from '../feedback/toastContext'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Dialog } from '../ui/Dialog'
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

  const watchlists = watchlistsQuery.data?.content ?? []
  const createError = createWatchlistMutation.error instanceof ApiClientError
    ? createWatchlistMutation.error.message
    : null

  return (
    <Dialog
      description="Add this title to an existing watchlist or create a new one first."
      eyebrow="Watchlists"
      headerActions={
        <Button aria-label="Close watchlist dialog" onClick={onClose} variant="ghost">
          <X aria-hidden="true" className="size-4" />
        </Button>
      }
      onClose={onClose}
      open={open}
      size="lg"
      title={`Organize ${title}`}
    >
      <div className="space-y-6">
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

        <div className="max-h-[calc(100dvh-20rem)] space-y-3 overflow-y-auto pr-1">
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
      </div>
    </Dialog>
  )
}

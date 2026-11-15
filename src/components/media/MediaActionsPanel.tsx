import { useState } from 'react'
import { Check, Heart, ListPlus } from 'lucide-react'

import type { MediaType, WatchStatus } from '../../types/enums'
import { cn } from '../../utils/cn'
import { Spinner } from '../feedback/Spinner'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface MediaActionsPanelProps {
  isFavourited: boolean | null | undefined
  mediaType: MediaType
  onOpenWatchlists: () => void
  onSubmitStatus: (status: WatchStatus) => Promise<unknown> | void
  onToggleFavourite: () => Promise<unknown> | void
  pending: boolean
  watchStatus: WatchStatus | null | undefined
}

export function MediaActionsPanel({
  isFavourited,
  mediaType,
  onOpenWatchlists,
  onSubmitStatus,
  onToggleFavourite,
  pending,
  watchStatus,
}: MediaActionsPanelProps) {
  const isWatched = watchStatus === 'WATCHED'
  const isPlanned = watchStatus === 'TO_WATCH'
  // Completion feedback fires only for state changes made in this session,
  // never for statuses that arrived with the page.
  const [watchedOnMount] = useState(isWatched)
  const [favouritedOnMount] = useState(isFavourited === true)

  return (
    <Card className="wm-media-actions space-y-4 overflow-hidden border-white/10 bg-[color:var(--color-surface-1)] p-5 shadow-none sm:space-y-6 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(111,209,168,0.30)_50%,rgba(255,255,255,0)_100%)]" />
      <div className="space-y-2.5">
        <h2 className="font-display text-2xl tracking-[-0.04em] text-white sm:text-3xl">Track this title.</h2>
        <p className="hidden text-sm leading-7 text-[color:var(--color-text-secondary)] sm:block">
          Save favourites, organize watchlists, and keep your status in sync.
        </p>
      </div>

      <div className="grid gap-3">
        {mediaType === 'MOVIE' ? (
          <>
            <Button
              className="justify-start"
              disabled={pending}
              onClick={() => {
                void onSubmitStatus(isWatched ? 'NONE' : 'WATCHED')
              }}
              variant={isWatched ? 'primary' : 'secondary'}
            >
              <Check
                aria-hidden="true"
                className={cn('mr-2 size-4', isWatched && !watchedOnMount && 'motion-check-pop')}
              />
              {isWatched ? 'Watched' : 'Mark as watched'}
            </Button>
            <Button
              className="justify-start"
              disabled={pending}
              onClick={() => {
                void onSubmitStatus(isPlanned ? 'NONE' : 'TO_WATCH')
              }}
              variant={isPlanned ? 'secondary' : 'ghost'}
            >
              {isPlanned ? <Check aria-hidden="true" className="mr-2 size-4" /> : null}
              {isPlanned ? 'Planned' : 'Plan to watch'}
            </Button>
          </>
        ) : (
          <>
            <Button
              className="justify-start"
              disabled={pending}
              onClick={() => {
                void onSubmitStatus('WATCHED')
              }}
              variant={watchStatus === 'WATCHED' ? 'primary' : 'secondary'}
            >
              {pending ? (
                <Spinner className="mr-2 text-current" size="sm" />
              ) : (
                <Check
                  aria-hidden="true"
                  className={cn(
                    'mr-2 size-4',
                    watchStatus === 'WATCHED' && !watchedOnMount && 'motion-check-pop',
                  )}
                />
              )}
              {pending
                ? 'Marking watched…'
                : watchStatus === 'WATCHED'
                  ? 'All watched'
                  : 'Mark all watched'}
            </Button>
            <Button
              className="justify-start"
              disabled={pending}
              onClick={() => {
                void onSubmitStatus(isPlanned ? 'NONE' : 'TO_WATCH')
              }}
              variant={isPlanned ? 'secondary' : 'ghost'}
            >
              {isPlanned ? <Check aria-hidden="true" className="mr-2 size-4" /> : null}
              {isPlanned ? 'Planned' : 'Plan to watch'}
            </Button>
          </>
        )}

        <Button
          className="justify-start"
          disabled={pending}
          onClick={() => {
            void onToggleFavourite()
          }}
          variant={isFavourited ? 'secondary' : 'ghost'}
        >
          <Heart
            aria-hidden="true"
            className={cn(
              'mr-2 size-4 transition duration-200',
              isFavourited && 'fill-current text-[color:var(--color-highlight)]',
              isFavourited && !favouritedOnMount && 'motion-heart-pop',
            )}
          />
          {isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        </Button>

        <Button className="justify-start" disabled={pending} onClick={onOpenWatchlists} variant="ghost">
          <ListPlus aria-hidden="true" className="mr-2 size-4" />
          Manage watchlists
        </Button>
      </div>
    </Card>
  )
}

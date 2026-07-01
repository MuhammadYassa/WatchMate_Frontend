import { Check, Heart, ListPlus, Loader2 } from 'lucide-react'

import type { MediaType, WatchStatus } from '../../types/enums'
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

  return (
    <Card className="space-y-6 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.94)_0%,rgba(10,11,15,0.99)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.38)] md:sticky md:top-28">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(111,209,168,0.30)_50%,rgba(255,255,255,0)_100%)]" />
      <div className="space-y-2.5">
        <h2 className="font-display text-3xl tracking-[-0.04em] text-white">Track this title.</h2>
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
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
              <Check aria-hidden="true" className="mr-2 size-4" />
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
                <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
              ) : (
                <Check aria-hidden="true" className="mr-2 size-4" />
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
          <Heart aria-hidden="true" className="mr-2 size-4" />
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

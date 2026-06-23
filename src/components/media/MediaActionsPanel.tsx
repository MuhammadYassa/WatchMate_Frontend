import { Heart, ListPlus, Radar } from 'lucide-react'
import { useState } from 'react'

import type { MediaType, WatchStatus } from '../../types/enums'
import { formatWatchStatus } from '../../utils/labels'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Select } from '../ui/Select'

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
  const [statusOverride, setStatusOverride] = useState<WatchStatus | null>(null)
  const availableStatuses: WatchStatus[] = mediaType === 'MOVIE'
    ? ['NONE', 'TO_WATCH', 'WATCHING', 'WATCHED']
    : ['NONE', 'TO_WATCH', 'WATCHING', 'UP_TO_DATE', 'WATCHED']
  const selectedStatus = statusOverride ?? watchStatus ?? 'NONE'

  return (
    <Card className="space-y-6 border-white/10 bg-[linear-gradient(145deg,rgba(21,22,27,0.94)_0%,rgba(10,11,15,0.98)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.38)] md:sticky md:top-28">
      <div className="space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Your actions
        </p>
        <h2 className="font-display text-3xl tracking-[-0.04em] text-white">Track this title your way.</h2>
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          Save favourites, organize watchlists, and keep your current status in sync.
        </p>
      </div>

      <div className="grid gap-3">
        <Button
          className="justify-start"
          disabled={pending}
          onClick={() => {
            void onToggleFavourite()
          }}
          variant={isFavourited ? 'primary' : 'secondary'}
        >
          <Heart aria-hidden="true" className="mr-2 size-4" />
          {isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        </Button>
        <Button className="justify-start" disabled={pending} onClick={onOpenWatchlists} variant="secondary">
          <ListPlus aria-hidden="true" className="mr-2 size-4" />
          Manage watchlists
        </Button>
      </div>

      <div className="space-y-3 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-100" htmlFor={`status-${mediaType}`}>
            Watch status
          </label>
          <p className="text-sm leading-6 text-[color:var(--color-text-tertiary)]">
            Keep your saved state aligned with where you are right now.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Select
            className="bg-[rgba(10,12,16,0.8)]"
            disabled={pending}
            id={`status-${mediaType}`}
            onChange={(event) => setStatusOverride(event.target.value as WatchStatus)}
            value={selectedStatus}
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {formatWatchStatus(status)}
              </option>
            ))}
          </Select>
          <Button
            disabled={pending}
            onClick={() => {
              void onSubmitStatus(selectedStatus)
              setStatusOverride(null)
            }}
            variant="secondary"
          >
            <Radar aria-hidden="true" className="mr-2 size-4" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  )
}

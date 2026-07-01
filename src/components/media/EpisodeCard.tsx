import { useState } from 'react'
import { CalendarDays, Check, Circle, Clock3, Loader2, MonitorPlay } from 'lucide-react'

import type { ShowEpisodeDetailsDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'
import {
  formatAiredState,
  formatEpisodeLabel,
  formatRuntime,
  formatWatchedState,
} from '../../utils/labels'
import { getStillUrl, hasImagePath } from '../../utils/tmdbImages'
import { cn } from '../../utils/cn'
import { Card } from '../ui/Card'
import { CompletionStatusBadge, InformationalStatusBadge } from './StatusBadge'

interface EpisodeCardProps {
  episode: ShowEpisodeDetailsDTO
  onTick?: () => void
  tickPending?: boolean
}

export function EpisodeCard({ episode, onTick, tickPending }: EpisodeCardProps) {
  const watchedLabel = formatWatchedState(episode.watched)
  const airedLabel = formatAiredState(episode.isAired)
  const [imageFailed, setImageFailed] = useState(false)
  const isUnaired = episode.isAired === false
  const isWatched = episode.watched === true
  const episodePositionLabel = `Season ${episode.seasonNumber} Episode ${episode.episodeNumber}`

  return (
    <Card
      className={cn(
        'group grid gap-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(22,20,18,0.9)_0%,rgba(12,11,9,0.98)_100%)] p-4 shadow-[0_22px_50px_rgba(0,0,0,0.3)] transition duration-300 hover:border-[rgba(47,174,126,0.16)] hover:shadow-[0_30px_72px_rgba(0,0,0,0.44)] md:p-5 lg:grid-cols-[280px_1fr]',
        isWatched
          ? 'border-[rgba(111,209,168,0.28)] bg-[linear-gradient(160deg,rgba(20,32,27,0.82)_0%,rgba(12,11,9,0.98)_100%)]'
          : null,
      )}
    >
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.06)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[linear-gradient(180deg,#161922_0%,#0d0e11_100%)]">
        {hasImagePath(episode.stillPath) && !imageFailed ? (
          <img
            alt={`${episode.name} still`}
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
            src={getStillUrl(episode.stillPath, 'w300') ?? undefined}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-[color:var(--color-text-tertiary)]">
            <MonitorPlay aria-hidden="true" className="size-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[linear-gradient(180deg,rgba(7,8,11,0)_0%,rgba(7,8,11,0.86)_100%)] px-4 py-3">
          <span className="rounded-[10px] border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-white/90 backdrop-blur-md">
            {formatEpisodeLabel(episode.episodeNumber)}
          </span>
        </div>
      </div>
      <div className="relative space-y-4 self-center">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
              Episode detail
            </p>
            <h2 className="font-display text-[2rem] tracking-[-0.04em] text-white">{episode.name}</h2>
          </div>

          {onTick ? (
            <button
              aria-label={
                isWatched
                  ? `Watched: ${episodePositionLabel}`
                  : `Mark watched through this episode: ${episodePositionLabel}`
              }
              aria-pressed={isWatched}
              className={cn(
                'mt-1 flex size-11 shrink-0 items-center justify-center rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]',
                isWatched
                  ? 'border-[rgba(111,209,168,0.55)] bg-[color:var(--color-accent)] text-black shadow-[0_0_0_4px_rgba(111,209,168,0.12)] hover:bg-[color:var(--color-accent-strong)]'
                  : 'border-[rgba(255,255,255,0.24)] bg-transparent text-[color:var(--color-text-secondary)] hover:border-[rgba(111,209,168,0.48)] hover:bg-[rgba(111,209,168,0.08)] hover:text-[color:var(--color-accent)]',
              )}
              disabled={tickPending}
              onClick={onTick}
              title={tickPending ? 'Syncing progress…' : isWatched ? 'Watched' : 'Mark watched through this episode'}
              type="button"
            >
              {tickPending ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              ) : isWatched ? (
                <Check aria-hidden="true" className="size-5 stroke-[3]" />
              ) : (
                <Circle aria-hidden="true" className="size-5" />
              )}
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {isUnaired ? (
            <InformationalStatusBadge label={airedLabel} tone="accent" />
          ) : (
            <InformationalStatusBadge label={airedLabel} />
          )}
          {watchedLabel ? (
            episode.watched ? (
              <CompletionStatusBadge label={watchedLabel} />
            ) : (
              <InformationalStatusBadge label={watchedLabel} />
            )
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2">
            <CalendarDays aria-hidden="true" className="size-4 text-[color:var(--color-text-tertiary)]" />
            {formatDisplayDate(episode.airDate)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2">
            <Clock3 aria-hidden="true" className="size-4 text-[color:var(--color-text-tertiary)]" />
            {formatRuntime(episode.runtime)}
          </span>
        </div>

        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          {episode.overview || 'No overview is available for this episode yet.'}
        </p>
      </div>
    </Card>
  )
}

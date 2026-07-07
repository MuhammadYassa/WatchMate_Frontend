import { useState } from 'react'
import { CalendarDays, Check, Clock3, MonitorPlay } from 'lucide-react'

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
import { Spinner } from '../feedback/Spinner'
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
  // Pop the check only when the user completes the episode in this session,
  // not for episodes that were already watched when the page loaded.
  const [watchedOnMount] = useState(isWatched)
  const episodePositionLabel = `Season ${episode.seasonNumber} Episode ${episode.episodeNumber}`

  return (
    <Card
      className={cn(
        'group grid gap-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(22,24,26,0.9)_0%,rgba(13,14,15,0.98)_100%)] p-4 shadow-[0_22px_50px_rgba(0,0,0,0.3)] transition duration-300 hover:border-[rgba(47,174,126,0.16)] hover:shadow-[0_30px_72px_rgba(0,0,0,0.44)] sm:gap-5 md:p-5 lg:grid-cols-[280px_minmax(0,1fr)]',
        isWatched
          ? 'border-[rgba(111,209,168,0.28)] bg-[linear-gradient(160deg,rgba(20,32,27,0.82)_0%,rgba(13,14,15,0.98)_100%)]'
          : null,
      )}
    >
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.06)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[linear-gradient(180deg,#161922_0%,#0d0e11_100%)]">
        {hasImagePath(episode.stillPath) && !imageFailed ? (
          <img
            alt={`${episode.name} still`}
            className="aspect-video w-full object-cover transition duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.03]"
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
      <div className="relative min-w-0 space-y-3 self-center sm:space-y-4">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <p className="hidden text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)] sm:block">
              Episode detail
            </p>
            <h2 className="break-words font-display text-[1.35rem] leading-[1.15] tracking-[-0.04em] text-white sm:text-[2rem] sm:leading-tight">{episode.name}</h2>
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
                'mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full transition duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] sm:mt-1',
                isWatched
                  ? cn(
                      'border border-transparent bg-[color:var(--color-action)] text-[color:var(--color-action-ink)] shadow-[0_0_0_4px_rgba(69,199,147,0.16),0_6px_18px_rgba(69,199,147,0.28)] hover:brightness-105',
                      !watchedOnMount && 'motion-check-ring',
                    )
                  : 'border-2 border-white/30 bg-transparent text-white/30 hover:border-[rgba(111,209,168,0.55)] hover:bg-[rgba(111,209,168,0.08)] hover:text-[color:var(--color-accent)]',
              )}
              disabled={tickPending}
              onClick={onTick}
              title={tickPending ? 'Syncing progress…' : isWatched ? 'Watched' : 'Mark watched through this episode'}
              type="button"
            >
              {tickPending ? (
                <Spinner className="text-current" size="md" />
              ) : (
                <Check
                  aria-hidden="true"
                  className={cn(
                    'size-5',
                    isWatched ? 'stroke-[3.5]' : 'stroke-[2.5]',
                    isWatched && !watchedOnMount && 'motion-check-pop',
                  )}
                />
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

        <div className="flex flex-wrap gap-2 text-[13px] text-[color:var(--color-text-secondary)] sm:gap-3 sm:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 sm:gap-2 sm:rounded-[12px] sm:px-3 sm:py-2">
            <CalendarDays aria-hidden="true" className="size-3.5 text-[color:var(--color-text-tertiary)] sm:size-4" />
            {formatDisplayDate(episode.airDate)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 sm:gap-2 sm:rounded-[12px] sm:px-3 sm:py-2">
            <Clock3 aria-hidden="true" className="size-3.5 text-[color:var(--color-text-tertiary)] sm:size-4" />
            {formatRuntime(episode.runtime)}
          </span>
        </div>

        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)] sm:leading-7">
          {episode.overview || 'No overview is available for this episode yet.'}
        </p>
      </div>
    </Card>
  )
}

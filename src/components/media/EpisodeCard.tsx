import { useState } from 'react'
import { CalendarDays, Clock3, MonitorPlay } from 'lucide-react'

import type { ShowEpisodeDetailsDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'
import {
  formatAiredState,
  formatEpisodeLabel,
  formatRuntime,
  formatWatchedState,
} from '../../utils/labels'
import { getStillUrl, hasImagePath } from '../../utils/tmdbImages'
import { Card } from '../ui/Card'
import { CompletionStatusBadge, InformationalStatusBadge } from './StatusBadge'

export function EpisodeCard({ episode }: { episode: ShowEpisodeDetailsDTO }) {
  const watchedLabel = formatWatchedState(episode.watched)
  const airedLabel = formatAiredState(episode.isAired)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Card className="grid gap-5 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-4 shadow-[0_22px_50px_rgba(0,0,0,0.3)] md:p-5 lg:grid-cols-[260px_1fr]">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#161922_0%,#0d0e11_100%)]">
        {hasImagePath(episode.stillPath) && !imageFailed ? (
          <img
            alt={`${episode.name} still`}
            className="aspect-video w-full object-cover"
            onError={() => setImageFailed(true)}
            src={getStillUrl(episode.stillPath, 'w300') ?? undefined}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-[color:var(--color-text-tertiary)]">
            <MonitorPlay aria-hidden="true" className="size-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[linear-gradient(180deg,rgba(7,8,11,0)_0%,rgba(7,8,11,0.86)_100%)] px-4 py-3">
          <span className="text-[11px] uppercase tracking-[0.28em] text-white/85">
            {formatEpisodeLabel(episode.episodeNumber)}
          </span>
        </div>
      </div>
      <div className="space-y-4 self-center">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            Episode detail
          </p>
          <h2 className="font-display text-3xl tracking-[-0.04em] text-white">{episode.name}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {episode.isAired === false ? (
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
          <span className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2">
            <CalendarDays aria-hidden="true" className="size-4 text-[color:var(--color-text-tertiary)]" />
            {formatDisplayDate(episode.airDate)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2">
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

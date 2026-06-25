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
    <Card className="group grid gap-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-4 shadow-[0_22px_50px_rgba(0,0,0,0.3)] transition duration-300 hover:border-[rgba(173,198,255,0.14)] hover:shadow-[0_30px_72px_rgba(0,0,0,0.38)] md:p-5 lg:grid-cols-[280px_1fr]">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(173,198,255,0.08)_0%,rgba(173,198,255,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,#161922_0%,#0d0e11_100%)]">
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
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            Episode detail
          </p>
          <h2 className="font-display text-[2rem] tracking-[-0.04em] text-white">{episode.name}</h2>
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

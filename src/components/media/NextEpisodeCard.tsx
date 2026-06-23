import { CalendarDays, Tv2 } from 'lucide-react'

import type { NextEpisodeAiringDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'
import { Card } from '../ui/Card'

export function NextEpisodeCard({ nextEpisode }: { nextEpisode: NextEpisodeAiringDTO }) {
  if (!nextEpisode.nextEpisodeAirDate && !nextEpisode.episodeName) {
    return (
      <Card className="space-y-4 border-white/10 bg-[linear-gradient(145deg,rgba(19,20,25,0.92)_0%,rgba(10,11,15,0.98)_100%)] p-6">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Next episode
        </p>
        <h3 className="font-display text-3xl tracking-[-0.04em] text-white">
          No upcoming episode is scheduled yet.
        </h3>
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          Check back later for the next confirmed air date.
        </p>
      </Card>
    )
  }

  return (
    <Card className="space-y-5 border-white/10 bg-[linear-gradient(145deg,rgba(19,20,25,0.92)_0%,rgba(10,11,15,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
      <div className="space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Next episode
        </p>
        <h3 className="font-display text-3xl tracking-[-0.04em] text-white">
          {nextEpisode.episodeName || 'Upcoming episode'}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(nextEpisode.seasonNumber !== null && nextEpisode.episodeNumber !== null) ? (
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
            <span className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
              <Tv2 aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
              Season {nextEpisode.seasonNumber} Episode {nextEpisode.episodeNumber}
            </span>
          </div>
        ) : null}
        {nextEpisode.nextEpisodeAirDate ? (
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
            <span className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
              <CalendarDays aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
              {formatDisplayDate(nextEpisode.nextEpisodeAirDate)}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

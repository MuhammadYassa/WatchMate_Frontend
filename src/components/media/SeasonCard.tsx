import { useState } from 'react'
import { Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ShowSeasonSummaryDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'
import { formatSeasonLabel } from '../../utils/labels'
import { getPosterUrl, hasImagePath } from '../../utils/tmdbImages'
import { Card } from '../ui/Card'
import { PosterPlaceholder } from './PosterPlaceholder'

interface SeasonCardProps {
  season: ShowSeasonSummaryDTO
  showTmdbId: number
}

export function SeasonCard({ season, showTmdbId }: SeasonCardProps) {
  const label = season.seasonNumber === 0 ? 'Specials' : formatSeasonLabel(season.seasonNumber)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link className="group block focus-visible:outline-none" to={`/shows/${showTmdbId}/seasons/${season.seasonNumber}/episodes`}>
      <Card className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-4 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] p-3.5 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/16 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.42)] group-focus-visible:border-[rgba(47,174,126,0.55)] group-focus-visible:shadow-[0_0_0_3px_var(--color-accent-glow)] sm:grid-cols-[138px_minmax(0,1fr)] sm:gap-5 sm:p-5">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.06)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="relative self-start overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_18px_35px_rgba(0,0,0,0.28)] sm:max-w-[138px] sm:self-auto">
          {hasImagePath(season.posterPath) && !imageFailed ? (
            <img
              alt={`${season.name || label} poster`}
              className="aspect-[2/3] w-full object-cover transition duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04]"
              onError={() => setImageFailed(true)}
              src={getPosterUrl(season.posterPath, 'w342') ?? undefined}
            />
          ) : (
            <PosterPlaceholder title={season.name || label} />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(7,8,11,0)_0%,rgba(7,8,11,0.78)_100%)]" />
        </div>
        <div className="relative min-w-0 space-y-2.5 self-center sm:space-y-4">
          <div className="space-y-1 sm:space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)] sm:text-[11px] sm:tracking-[0.28em]">
              {label}
            </p>
            <h3 className="break-words font-display text-xl tracking-[-0.04em] text-white sm:text-3xl">
              {season.name || label}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 text-[13px] text-[color:var(--color-text-secondary)] sm:gap-3 sm:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 sm:gap-2 sm:rounded-[12px] sm:px-3 sm:py-2">
              <Layers3 aria-hidden="true" className="size-3.5 text-[color:var(--color-accent)]" />
              {season.episodeCount ?? '-'} episodes
            </span>
            {season.airDate ? (
              <span className="inline-flex items-center rounded-[10px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 sm:rounded-[12px] sm:px-3 sm:py-2">
                {formatDisplayDate(season.airDate)}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  )
}

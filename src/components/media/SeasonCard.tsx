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
      <Card className="grid gap-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] p-4 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/16 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.42)] sm:grid-cols-[138px_1fr] sm:p-5">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.06)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="relative max-w-[138px] overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_18px_35px_rgba(0,0,0,0.28)]">
          {hasImagePath(season.posterPath) && !imageFailed ? (
            <img
              alt={`${season.name || label} poster`}
              className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              onError={() => setImageFailed(true)}
              src={getPosterUrl(season.posterPath, 'w342') ?? undefined}
            />
          ) : (
            <PosterPlaceholder title={season.name || label} />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(7,8,11,0)_0%,rgba(7,8,11,0.78)_100%)]" />
        </div>
        <div className="relative space-y-4 self-center">
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
              {label}
            </p>
            <h3 className="font-display text-3xl tracking-[-0.04em] text-white">
              {season.name || label}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2">
              <Layers3 aria-hidden="true" className="size-3.5 text-[color:var(--color-accent)]" />
              {season.episodeCount ?? 'â€”'} episodes
            </span>
            {season.airDate ? (
              <span className="inline-flex items-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2">
                {formatDisplayDate(season.airDate)}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  )
}

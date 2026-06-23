import { useState } from 'react'
import { CalendarDays, Clapperboard, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { SearchItemDTO } from '../../types/api'
import { formatDisplayDate } from '../../utils/dates'
import { getSearchResultRoute } from '../../utils/mediaRoutes'
import { getPosterUrl, hasImagePath } from '../../utils/tmdbImages'
import { PosterPlaceholder } from './PosterPlaceholder'

export function SearchResultCard({ item }: { item: SearchItemDTO }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      className="group grid grid-cols-[96px_1fr] items-start gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-4 shadow-[0_24px_55px_rgba(0,0,0,0.32)] transition duration-300 hover:border-white/16 hover:bg-[linear-gradient(145deg,rgba(24,25,29,0.96)_0%,rgba(13,14,18,0.98)_100%)] hover:shadow-[0_32px_70px_rgba(0,0,0,0.42)] sm:grid-cols-[116px_1fr] sm:gap-5 md:grid-cols-[140px_1fr] md:p-5"
      to={getSearchResultRoute(item.id, item.mediaType)}
    >
      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_18px_35px_rgba(0,0,0,0.28)]">
        {hasImagePath(item.posterPath) && !imageFailed ? (
          <img
            alt={`${item.title} poster`}
            className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={getPosterUrl(item.posterPath, 'w342') ?? undefined}
          />
        ) : (
          <PosterPlaceholder title={item.title} />
        )}
      </div>
      <div className="space-y-3.5 self-center">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            {item.mediaType === 'movie' ? 'Movie' : 'Show'}
          </p>
          <h2 className="font-display text-3xl tracking-[-0.04em] text-white md:text-4xl">
            {item.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-text-secondary)]">
          {item.releaseDate ? (
            <span className="inline-flex items-center gap-2">
              <CalendarDays
                aria-hidden="true"
                className="size-4 text-[color:var(--color-text-tertiary)]"
              />
              {formatDisplayDate(item.releaseDate)}
            </span>
          ) : null}
          {typeof item.voteAverage === 'number' ? (
            <span className="inline-flex items-center gap-2">
              <Star aria-hidden="true" className="size-4 fill-current text-[color:var(--color-warning)]" />
              {item.voteAverage.toFixed(1)}
            </span>
          ) : null}
          {item.genres.length > 0 ? (
            <span className="inline-flex items-center gap-2">
              <Clapperboard
                aria-hidden="true"
                className="size-4 text-[color:var(--color-text-tertiary)]"
              />
              {item.genres.slice(0, 3).join(' / ')}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
          {item.overview || 'No overview available yet.'}
        </p>
      </div>
    </Link>
  )
}

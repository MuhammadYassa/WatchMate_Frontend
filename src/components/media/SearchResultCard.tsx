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
      className="motion-card group relative grid grid-cols-[92px_1fr] items-start gap-4 overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(22,20,18,0.88)_0%,rgba(11,10,8,0.96)_100%)] p-4 shadow-[0_24px_55px_rgba(0,0,0,0.28)] transition duration-300 hover:border-[rgba(47,174,126,0.18)] hover:shadow-[0_34px_82px_rgba(0,0,0,0.46)] sm:grid-cols-[116px_1fr] sm:gap-5 md:grid-cols-[138px_1fr] md:p-5"
      to={getSearchResultRoute(item.id, item.mediaType)}
    >
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.07)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_18px_35px_rgba(0,0,0,0.28)]">
        {hasImagePath(item.posterPath) && !imageFailed ? (
          <img
            alt={`${item.title} poster`}
            className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={getPosterUrl(item.posterPath, 'w342') ?? undefined}
          />
        ) : (
          <PosterPlaceholder title={item.title} />
        )}
      </div>
      <div className="relative flex min-h-full flex-col justify-between gap-5 self-stretch">
        <div className="space-y-3">
          <h2 className="font-display text-[1.9rem] leading-none tracking-[-0.04em] text-white md:text-[2.6rem]">
            {item.title}
          </h2>
          <div className="flex flex-wrap gap-2.5 text-sm text-[color:var(--color-text-secondary)]">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-text-tertiary)]">
              {item.mediaType === 'movie' ? 'Movie' : 'Show'}
            </span>
            {item.releaseDate ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <CalendarDays
                  aria-hidden="true"
                  className="size-4 text-[color:var(--color-text-tertiary)]"
                />
                {formatDisplayDate(item.releaseDate)}
              </span>
            ) : null}
            {typeof item.voteAverage === 'number' ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(111,209,168,0.18)] bg-[rgba(111,209,168,0.08)] px-3 py-1.5">
                <Star aria-hidden="true" className="size-4 fill-current text-[color:var(--color-highlight)]" />
                {item.voteAverage.toFixed(1)}
              </span>
            ) : null}
            {item.genres.length > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Clapperboard
                  aria-hidden="true"
                  className="size-4 text-[color:var(--color-text-tertiary)]"
                />
                {item.genres.slice(0, 3).join(' / ')}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-3 max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
            {item.overview || 'No overview available yet.'}
          </p>
        </div>
      </div>
    </Link>
  )
}

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getButtonClassName } from '../ui/buttonStyles'
import { getPosterUrl, hasImagePath } from '../../utils/tmdbImages'
import { PosterPlaceholder } from './PosterPlaceholder'
import { formatDisplayDate } from '../../utils/dates'

interface PosterCardProps {
  className?: string
  href: string
  imagePath?: string | null
  mediaTypeLabel?: string
  releaseDate?: string | null
  rating?: number | null
  title: string
  variant?: 'grid' | 'rail'
}

export function PosterCard({
  className,
  href,
  imagePath,
  mediaTypeLabel,
  releaseDate,
  rating,
  title,
  variant = 'rail',
}: PosterCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      className={[
        'group block space-y-3 focus-visible:outline-none',
        variant === 'rail'
          ? 'min-w-[164px] max-w-[164px] shrink-0 snap-start sm:min-w-[186px] sm:max-w-[186px]'
          : 'min-w-0 max-w-none',
        className ?? '',
      ].join(' ')}
      to={href}
    >
      <div className="motion-poster relative overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[0_18px_40px_rgba(0,0,0,0.32)] group-hover:border-[rgba(173,198,255,0.24)] group-hover:shadow-[0_26px_62px_rgba(0,0,0,0.42)]">
        {hasImagePath(imagePath) && !imageFailed ? (
          <img
            alt={`${title} poster`}
            className="aspect-[2/3] w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={getPosterUrl(imagePath, 'w342') ?? undefined}
          />
        ) : (
          <PosterPlaceholder title={title} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(8,9,12,0)_0%,rgba(8,9,12,0.9)_100%)]" />
        {typeof rating === 'number' ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-[10px] border border-white/14 bg-[rgba(8,9,12,0.78)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-warning)] backdrop-blur-xl">
            <Star aria-hidden="true" className="size-3 fill-current" />
            {rating.toFixed(1)}
          </div>
        ) : null}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 rounded-[10px] border border-white/10 bg-[rgba(8,9,12,0.72)] px-3 py-2 opacity-0 backdrop-blur-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
            {mediaTypeLabel ? <span>{mediaTypeLabel}</span> : null}
            {releaseDate ? <span>{formatDisplayDate(releaseDate)}</span> : null}
          </div>
        </div>
      </div>
      <div className="space-y-1.5 px-0.5">
        <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-white">{title}</p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
          {mediaTypeLabel ? <span>{mediaTypeLabel}</span> : null}
          {releaseDate ? <span>{formatDisplayDate(releaseDate)}</span> : null}
        </div>
      </div>
    </Link>
  )
}

export function PosterCardActionLink({
  className,
  href,
  label,
}: {
  className?: string
  href: string
  label: string
}) {
  return (
    <Link className={getButtonClassName('secondary', className)} to={href}>
      {label}
    </Link>
  )
}

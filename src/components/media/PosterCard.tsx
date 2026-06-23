import { useState } from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getButtonClassName } from '../ui/buttonStyles'
import { getPosterUrl, hasImagePath } from '../../utils/tmdbImages'
import { PosterPlaceholder } from './PosterPlaceholder'
import { formatDisplayDate } from '../../utils/dates'

interface PosterCardProps {
  href: string
  imagePath?: string | null
  mediaTypeLabel?: string
  releaseDate?: string | null
  rating?: number | null
  title: string
}

export function PosterCard({
  href,
  imagePath,
  mediaTypeLabel,
  releaseDate,
  rating,
  title,
}: PosterCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Link
      className="group block min-w-[162px] max-w-[162px] shrink-0 snap-start space-y-3 focus-visible:outline-none sm:min-w-[182px] sm:max-w-[182px]"
      to={href}
    >
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.04)] shadow-[0_20px_50px_rgba(0,0,0,0.34)] transition duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-white/16 group-hover:shadow-[0_30px_65px_rgba(0,0,0,0.48)]">
        {hasImagePath(imagePath) && !imageFailed ? (
          <img
            alt={`${title} poster`}
            className="aspect-[2/3] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={getPosterUrl(imagePath, 'w342') ?? undefined}
          />
        ) : (
          <PosterPlaceholder title={title} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(8,9,12,0)_0%,rgba(8,9,12,0.84)_100%)]" />
        {typeof rating === 'number' ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/14 bg-[rgba(8,9,12,0.78)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-warning)] backdrop-blur-xl">
            <Star aria-hidden="true" className="size-3 fill-current" />
            {rating.toFixed(1)}
          </div>
        ) : null}
      </div>
      <div className="space-y-2 px-1.5">
        <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-white">{title}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-tertiary)]">
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

import { useState, type ReactNode } from 'react'

import { getBackdropUrl, getPosterUrl, hasImagePath } from '../../utils/tmdbImages'
import { PosterPlaceholder } from './PosterPlaceholder'

interface DetailHeroProps {
  actionArea?: ReactNode
  backdropPath?: string | null
  badges?: ReactNode
  meta?: ReactNode
  overview: string
  posterPath?: string | null
  title: string
}

export function DetailHero({
  actionArea,
  backdropPath,
  badges,
  meta,
  overview,
  posterPath,
  title,
}: DetailHeroProps) {
  const [backdropFailed, setBackdropFailed] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#0d0e11]">
      {hasImagePath(backdropPath) && !backdropFailed ? (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-42"
          onError={() => setBackdropFailed(true)}
          src={getBackdropUrl(backdropPath, 'w1280') ?? undefined}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.18)_0%,rgba(7,8,11,0.72)_48%,rgba(7,8,11,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,8,11,0.96)_14%,rgba(7,8,11,0.8)_52%,rgba(7,8,11,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.18)_0%,rgba(173,198,255,0)_34%),radial-gradient(circle_at_bottom_left,rgba(255,222,164,0.12)_0%,rgba(255,222,164,0)_28%)]" />

      <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-12 pt-24 sm:px-6 md:pb-14 md:pt-28 lg:px-8 xl:px-12">
        <div className="grid items-end gap-8 lg:min-h-[32rem] lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="w-full max-w-[260px] lg:max-w-none">
            <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
              {hasImagePath(posterPath) && !posterFailed ? (
                <img
                  alt={`${title} poster`}
                  className="aspect-[2/3] w-full object-cover"
                  onError={() => setPosterFailed(true)}
                  src={getPosterUrl(posterPath, 'w500') ?? undefined}
                />
              ) : (
                <PosterPlaceholder title={title} />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(7,8,11,0)_0%,rgba(7,8,11,0.68)_100%)]" />
            </div>
          </div>

          <div className="max-w-4xl space-y-6 pb-1">
            {meta ? <div className="flex flex-wrap gap-2.5">{meta}</div> : null}
            <div className="space-y-4">
              <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.05em] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)] md:text-6xl xl:text-7xl">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
                {overview}
              </p>
            </div>
            {badges ? <div className="flex flex-wrap gap-2.5">{badges}</div> : null}
            {actionArea ? <div className="flex flex-wrap gap-2.5">{actionArea}</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

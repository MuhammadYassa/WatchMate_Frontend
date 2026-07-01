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
    <section className="relative overflow-hidden border-b border-white/10 bg-[color:var(--color-bg)]">
      {hasImagePath(backdropPath) && !backdropFailed ? (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          onError={() => setBackdropFailed(true)}
          src={getBackdropUrl(backdropPath, 'w1280') ?? undefined}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.28)_0%,rgba(6,7,10,0.8)_58%,rgba(6,7,10,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(6,7,10,0.98)_12%,rgba(6,7,10,0.9)_44%,rgba(6,7,10,0.54)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,174,126,0.14)_0%,rgba(47,174,126,0)_34%),radial-gradient(circle_at_bottom_left,rgba(111,209,168,0.10)_0%,rgba(111,209,168,0)_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(6,7,10,0)_0%,rgba(6,7,10,0.84)_64%,rgba(6,7,10,1)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
        <div className="grid items-end gap-8 lg:min-h-[38rem] lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-10 xl:min-h-[42rem] xl:grid-cols-[336px_minmax(0,1fr)]">
          <div className="w-full max-w-[280px] lg:max-w-none">
            <div className="motion-poster relative overflow-hidden rounded-[var(--radius-media)] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_30px_80px_rgba(0,0,0,0.48)]">
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

          <div className="max-w-5xl space-y-6 pb-1 lg:pb-6">
            {meta ? <div className="motion-fade-in flex flex-wrap gap-2.5">{meta}</div> : null}
            <div className="space-y-5">
              <h1 className="motion-slide-up font-display text-5xl leading-[0.9] tracking-[-0.03em] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)] md:text-6xl xl:text-[5.4rem]">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
                {overview}
              </p>
            </div>
            {badges ? (
              <div className="flex flex-wrap gap-2.5 border-t border-white/10 pt-5">{badges}</div>
            ) : null}
            {actionArea ? (
              <div className="flex flex-wrap gap-2.5 border-t border-white/8 pt-5">{actionArea}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

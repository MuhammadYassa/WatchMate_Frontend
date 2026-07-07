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
  const [posterLoaded, setPosterLoaded] = useState(false)

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[color:var(--color-bg)]">
      {hasImagePath(backdropPath) && !backdropFailed ? (
        <img
          alt=""
          className="motion-hero-img absolute inset-0 h-full w-full object-cover [--hero-img-opacity:0.45]"
          onError={() => setBackdropFailed(true)}
          src={getBackdropUrl(backdropPath, 'w1280') ?? undefined}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.28)_0%,rgba(6,7,10,0.8)_58%,rgba(6,7,10,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(6,7,10,0.98)_12%,rgba(6,7,10,0.9)_44%,rgba(6,7,10,0.54)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,174,126,0.14)_0%,rgba(47,174,126,0)_34%),radial-gradient(circle_at_bottom_left,rgba(111,209,168,0.10)_0%,rgba(111,209,168,0)_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(6,7,10,0)_0%,rgba(6,7,10,0.84)_64%,rgba(6,7,10,1)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-10 pt-8 sm:px-6 md:pb-20 md:pt-28 lg:px-8 xl:px-12">
        <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-end gap-x-4 gap-y-5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-6 md:grid-cols-[11rem_minmax(0,1fr)] lg:min-h-[38rem] lg:grid-cols-[292px_minmax(0,1fr)] lg:content-end lg:gap-x-10 lg:gap-y-6 xl:min-h-[42rem] xl:grid-cols-[336px_minmax(0,1fr)]">
          <div className="w-full lg:row-span-2">
            <div className="motion-poster relative overflow-hidden rounded-[var(--radius-media)] border border-white/12 bg-[rgba(255,255,255,0.04)] shadow-[0_18px_44px_rgba(0,0,0,0.42)] lg:shadow-[0_30px_80px_rgba(0,0,0,0.48)]">
              {hasImagePath(posterPath) && !posterFailed ? (
                <img
                  alt={`${title} poster`}
                  className="img-reveal aspect-[2/3] w-full object-cover"
                  data-loaded={posterLoaded ? 'true' : 'false'}
                  onError={() => setPosterFailed(true)}
                  onLoad={() => setPosterLoaded(true)}
                  ref={(node) => {
                    if (node?.complete && node.naturalWidth > 0) {
                      setPosterLoaded(true)
                    }
                  }}
                  src={getPosterUrl(posterPath, 'w500') ?? undefined}
                />
              ) : (
                <PosterPlaceholder title={title} />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(7,8,11,0)_0%,rgba(7,8,11,0.68)_100%)]" />
            </div>
          </div>

          <div className="motion-stagger min-w-0 max-w-5xl space-y-2.5 self-end lg:space-y-6 lg:pb-0">
            {meta ? <div className="hidden flex-wrap gap-2.5 lg:flex">{meta}</div> : null}
            <div className="space-y-2 lg:space-y-5">
              <h1 className="break-words font-display text-[length:clamp(1.55rem,6.8vw,2.1rem)] leading-[1.04] tracking-[-0.03em] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)] md:text-6xl md:leading-[0.94] xl:text-[5.4rem]">
                {title}
              </h1>
              <p className="hidden max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:block md:text-base">
                {overview}
              </p>
            </div>
          </div>

          <div className="col-span-2 min-w-0 max-w-5xl space-y-4 lg:col-span-1 lg:col-start-2 lg:space-y-6 lg:pb-6">
            {meta ? <div className="flex flex-wrap gap-2 lg:hidden">{meta}</div> : null}
            {badges ? (
              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4 lg:gap-2.5 lg:pt-5">{badges}</div>
            ) : null}
            {actionArea ? (
              <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4 lg:gap-2.5 lg:pt-5">{actionArea}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

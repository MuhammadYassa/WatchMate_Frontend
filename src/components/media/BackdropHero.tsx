import { Link } from 'react-router-dom'

import { getButtonClassName } from '../ui/buttonStyles'
import { getBackdropUrl } from '../../utils/tmdbImages'

interface BackdropHeroProps {
  ctaHref: string
  ctaLabel: string
  imagePath?: string | null
  meta?: string
  subtitle: string
  title: string
}

export function BackdropHero({
  ctaHref,
  ctaLabel,
  imagePath,
  meta,
  subtitle,
  title,
}: BackdropHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,19,23,0.96)_0%,rgba(13,14,17,0.98)_60%,rgba(9,10,13,1)_100%)] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
      {imagePath ? (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          src={getBackdropUrl(imagePath, 'w1280') ?? undefined}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,13,0.98)_10%,rgba(10,10,13,0.8)_52%,rgba(10,10,13,0.3)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_32%,rgba(4,5,7,0.25)_100%)]" />
      <div className="relative z-10 flex min-h-[380px] flex-col justify-end gap-5 px-6 py-7 md:min-h-[470px] md:max-w-[60%] md:px-10 md:py-10 lg:px-12 lg:py-12">
        {meta ? (
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            {meta}
          </p>
        ) : null}
        <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.03em] text-white md:text-7xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className={getButtonClassName(undefined, 'min-w-[11.5rem] justify-center')} to={ctaHref}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

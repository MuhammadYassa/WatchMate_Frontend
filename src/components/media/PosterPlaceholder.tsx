import { Film } from 'lucide-react'

import { getTitleInitials } from '../../utils/tmdbImages'
import { cn } from '../../utils/cn'

interface PosterPlaceholderProps {
  title: string
  className?: string
}

export function PosterPlaceholder({ title, className }: PosterPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative aspect-[2/3] overflow-hidden rounded-[var(--radius-media)] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(47,174,126,0.18),_transparent_42%),linear-gradient(180deg,#1a1714_0%,#0d0b0a_100%)]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(13,13,15,0.95)_100%)]" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 text-[color:var(--color-text-tertiary)]">
        <Film aria-hidden="true" className="size-5" />
        <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
          Poster
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-2 text-3xl font-semibold tracking-tight text-white/90">
          {getTitleInitials(title)}
        </div>
        <div className="line-clamp-2 text-sm text-[color:var(--color-text-secondary)]">{title}</div>
      </div>
    </div>
  )
}

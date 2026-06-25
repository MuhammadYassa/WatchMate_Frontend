import { cn } from '../../utils/cn'
import { getTitleInitials } from '../../utils/tmdbImages'

const sizeClasses = {
  xl: 'size-28 rounded-[34px] text-4xl md:size-36 md:text-5xl',
  lg: 'size-24 rounded-[30px] text-3xl md:size-28 md:text-4xl',
  md: 'size-16 rounded-[24px] text-2xl',
  sm: 'size-12 rounded-[18px] text-lg',
} as const

type UserInitialBadgeSize = keyof typeof sizeClasses

function getUserInitials(username: string) {
  const normalized = username.replace(/[._-]+/g, ' ').trim()

  return getTitleInitials(normalized) || username.slice(0, 2).toUpperCase()
}

export function UserInitialBadge({
  className,
  size = 'md',
  username,
}: {
  className?: string
  size?: UserInitialBadgeSize
  username: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex items-center justify-center overflow-hidden border border-white/12 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.36),_rgba(31,35,44,0.98)_64%)] font-display text-[color:var(--color-accent)] shadow-[0_24px_60px_rgba(0,0,0,0.38)]',
        'before:absolute before:inset-0 before:bg-[linear-gradient(145deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_36%)] before:content-[""]',
        sizeClasses[size],
        className,
      )}
    >
      <span className="relative z-10">{getUserInitials(username)}</span>
    </div>
  )
}

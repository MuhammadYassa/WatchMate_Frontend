import { Link } from 'react-router-dom'

import { cn } from '../../utils/cn'

/**
 * WatchMate mark: a 20-tick progress ring (14 lit, 6 remaining) around a play
 * wedge. The ring is the brand story — "movies & shows, tracked" — so the lit
 * arc always starts at 12 o'clock and the open segment sits on the upper left.
 */
const TICK_COUNT = 20
const LIT_TICKS = 14

interface LogoMarkProps {
  size?: number
  className?: string
  /** 'ring' renders only the tick ring (used by the Spinner). */
  variant?: 'mark' | 'ring'
}

export function LogoMark({ size = 28, className, variant = 'mark' }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn('shrink-0', className)}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: TICK_COUNT }, (_, index) => (
        <rect
          key={index}
          fill="currentColor"
          height="3.8"
          opacity={index < LIT_TICKS ? 1 : 0.24}
          rx="1.1"
          transform={`rotate(${index * (360 / TICK_COUNT)} 16 16)`}
          width="2.3"
          x="14.85"
          y="2.4"
        />
      ))}
      {variant === 'mark' ? (
        <path d="M12.7 11.2 21.5 16l-8.8 4.8Z" fill="currentColor" />
      ) : null}
    </svg>
  )
}

export type LogoSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<LogoSize, { mark: number; text: string; gap: string }> = {
  sm: { mark: 24, text: 'text-[1.45rem]', gap: 'gap-2.5' },
  md: { mark: 28, text: 'text-[1.55rem]', gap: 'gap-3' },
  lg: { mark: 34, text: 'text-[1.8rem]', gap: 'gap-3' },
}

interface LogoProps {
  size?: LogoSize
  to?: string
  showWordmark?: boolean
  wordmarkClassName?: string
  className?: string
}

export function Logo({
  size = 'md',
  to,
  showWordmark = true,
  wordmarkClassName = 'text-white',
  className,
}: LogoProps) {
  const { mark, text, gap } = SIZE_MAP[size]

  const content = (
    <span className={cn('inline-flex items-center text-[color:var(--color-accent)]', gap, className)}>
      <LogoMark size={mark} />
      {showWordmark ? (
        <span
          className={cn('font-display leading-none tracking-[-0.02em]', wordmarkClassName, text)}
        >
          <span className="font-bold">watch</span>
          <span className="font-normal opacity-[0.66]">mate</span>
        </span>
      ) : null}
    </span>
  )

  if (to) {
    return (
      <Link className="inline-flex rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--color-bg)]" to={to}>
        {content}
      </Link>
    )
  }

  return content
}

import { Link } from 'react-router-dom'

import { cn } from '../../utils/cn'

interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 28, className }: LogoMarkProps) {
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
      <rect
        height="19"
        opacity="0.4"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.9"
        transform="rotate(-7 20.5 13.5)"
        width="13"
        x="14"
        y="4"
      />
      <rect
        fill="currentColor"
        height="21"
        rx="3.5"
        transform="rotate(2 12.5 19.5)"
        width="15"
        x="5"
        y="9"
      />
    </svg>
  )
}

export type LogoSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<LogoSize, { mark: number; text: string; gap: string }> = {
  sm: { mark: 22, text: 'text-[1.5rem]', gap: 'gap-2.5' },
  md: { mark: 26, text: 'text-[1.6rem]', gap: 'gap-3' },
  lg: { mark: 32, text: 'text-[1.85rem]', gap: 'gap-3' },
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
          className={cn('font-display font-semibold leading-none tracking-[-0.03em]', wordmarkClassName, text)}
        >
          WatchMate
        </span>
      ) : null}
    </span>
  )

  if (to) {
    return (
      <Link className="inline-flex" to={to}>
        {content}
      </Link>
    )
  }

  return content
}

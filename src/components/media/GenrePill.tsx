import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

interface GenrePillProps {
  className?: string
}

export function GenrePill({ children, className }: PropsWithChildren<GenrePillProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-3.5 py-2 text-xs font-medium text-[color:var(--color-text-secondary)] backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </span>
  )
}

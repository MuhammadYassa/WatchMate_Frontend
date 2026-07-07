import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

interface GenrePillProps {
  className?: string
}

export function GenrePill({ children, className }: PropsWithChildren<GenrePillProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[10px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-secondary)] backdrop-blur-xl sm:px-3.5 sm:py-2',
        className,
      )}
    >
      {children}
    </span>
  )
}

import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

interface MetadataPillProps {
  className?: string
}

export function MetadataPill({ children, className }: PropsWithChildren<MetadataPillProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-[rgba(10,12,16,0.6)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] backdrop-blur-xl sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.16em]',
        className,
      )}
    >
      {children}
    </span>
  )
}

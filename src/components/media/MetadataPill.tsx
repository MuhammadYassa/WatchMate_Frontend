import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

interface MetadataPillProps {
  className?: string
}

export function MetadataPill({ children, className }: PropsWithChildren<MetadataPillProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-[rgba(10,12,16,0.56)] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)] backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </span>
  )
}

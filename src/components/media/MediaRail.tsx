import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export function MediaRail({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'flex gap-4 overflow-x-auto pb-4 pr-4 pt-1 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}

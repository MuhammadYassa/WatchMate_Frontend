import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export function MediaRail({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'rail-fade-mask flex gap-4 overflow-x-auto pb-4 pr-4 pt-1 scroll-smooth [scrollbar-width:none] snap-x snap-proximity [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}

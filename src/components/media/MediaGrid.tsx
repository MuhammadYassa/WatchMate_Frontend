import type { PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export function MediaGrid({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

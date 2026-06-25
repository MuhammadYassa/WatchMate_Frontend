import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'
import { useShellMode } from './useShellMode'

export function PageContainer({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  const shellMode = useShellMode()

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-8 sm:px-6 md:pt-10',
        shellMode === 'side-rail'
          ? 'max-w-[1440px] lg:px-8 xl:px-10 2xl:px-14 md:pb-14'
          : 'max-w-[1320px] lg:px-8 xl:px-12 md:pb-28',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

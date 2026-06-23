import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export function PageContainer({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1320px] px-4 pb-28 pt-8 sm:px-6 lg:px-8 xl:px-12', className)}
      {...props}
    >
      {children}
    </div>
  )
}

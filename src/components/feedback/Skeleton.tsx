import type { HTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('shimmer-nocturne rounded-[var(--radius-control)]', className)}
      {...props}
    />
  )
}

export function SkeletonText() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-5/6 max-w-sm" />
    </div>
  )
}

export function SkeletonPoster() {
  return <Skeleton className="aspect-[2/3] w-full max-w-[180px] rounded-[var(--radius-media)]" />
}

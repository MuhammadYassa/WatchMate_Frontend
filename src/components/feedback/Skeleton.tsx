import type { HTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-[shimmer_1.6s_ease-in-out_infinite] rounded-2xl bg-[linear-gradient(90deg,#1a1b1f_20%,#262a33_48%,#1a1b1f_78%)] bg-[length:200%_100%]',
        className,
      )}
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
  return <Skeleton className="aspect-[2/3] w-full max-w-[180px] rounded-[20px]" />
}

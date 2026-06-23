import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/10 bg-[color:var(--color-surface-glass)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

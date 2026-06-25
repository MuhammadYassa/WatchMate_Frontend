import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'relative glass-hover-glow motion-card rounded-[var(--radius-panel)] border border-white/10 bg-[color:var(--color-surface-glass)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

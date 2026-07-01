import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../utils/cn'

export type CardVariant = 'default' | 'glass' | 'interactive'

const variantBase: Record<CardVariant, string> = {
  default:
    'border border-white/[0.07] bg-[color:var(--color-surface-1)] p-5',
  glass:
    'glass-hover-glow motion-card border border-white/10 bg-[color:var(--color-surface-glass)] p-5 shadow-[var(--shadow-panel)] backdrop-blur-xl',
  interactive:
    'motion-card border border-white/[0.07] bg-[color:var(--color-surface-1)] p-5 hover:border-white/[0.12] hover:bg-[color:var(--color-surface-2)]',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: PropsWithChildren<CardProps>) {
  return (
    <div
      className={cn(
        'relative rounded-[var(--radius-panel)]',
        variantBase[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

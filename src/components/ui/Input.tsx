import type { InputHTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className, error = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-[var(--radius-control)] border bg-[rgba(10,12,16,0.82)] px-4 py-3.5 text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-tertiary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition duration-300 focus-visible:outline-none',
        error
          ? 'border-[rgba(255,180,171,0.5)] bg-[rgba(147,0,10,0.18)]'
          : 'border-white/10 focus-visible:border-[rgba(173,198,255,0.42)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]',
        className,
      )}
      {...props}
    />
  )
}

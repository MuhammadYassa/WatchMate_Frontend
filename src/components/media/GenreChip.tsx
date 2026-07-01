import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

interface GenreChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function GenreChip({ active = false, className, ...props }: GenreChipProps) {
  return (
    <button
      className={cn(
        'motion-card rounded-[12px] border px-4 py-2.5 text-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]',
        active
          ? 'border-[rgba(47,174,126,0.28)] bg-[linear-gradient(145deg,rgba(47,174,126,0.10)_0%,rgba(47,174,126,0.04)_100%)] text-[color:var(--color-accent)] shadow-[0_10px_28px_rgba(47,174,126,0.08)]'
          : 'border-white/10 bg-[rgba(255,255,255,0.03)] text-[color:var(--color-text-secondary)] hover:border-white/18 hover:bg-[rgba(255,255,255,0.05)] hover:text-white',
        className,
      )}
      type="button"
      {...props}
    />
  )
}

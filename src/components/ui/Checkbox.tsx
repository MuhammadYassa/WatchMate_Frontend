import type { InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'

import { cn } from '../../utils/cn'

/**
 * Styled native checkbox. Keep it inside a `<label>` (or pair it with one)
 * so the text is part of the accessible name and enlarges the tap target.
 */
export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={cn('relative inline-flex size-5 shrink-0 items-center justify-center', className)}>
      <input
        className="peer size-5 cursor-pointer appearance-none rounded-[6px] border border-white/20 bg-[rgba(10,12,16,0.82)] transition duration-200 checked:border-[color:var(--color-action)] checked:bg-[color:var(--color-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50"
        type="checkbox"
        {...props}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute size-3.5 stroke-[3.5] text-[color:var(--color-action-ink)] opacity-0 transition duration-150 peer-checked:opacity-100"
      />
    </span>
  )
}

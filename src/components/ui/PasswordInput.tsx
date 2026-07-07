import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '../../utils/cn'
import { Input } from './Input'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
  /** Decorative icon rendered inside the field on the left (e.g. a lock). */
  leadingIcon?: ReactNode
}

/**
 * Password field with the visibility toggle inside the input, vertically
 * centered on the right. Owns its show/hide state so every password field
 * in the app behaves identically.
 */
export function PasswordInput({ className, error, leadingIcon, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      {leadingIcon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
        >
          {leadingIcon}
        </span>
      ) : null}
      <Input
        className={cn(leadingIcon ? 'pl-11' : null, 'pr-12', className)}
        error={error}
        type={visible ? 'text' : 'password'}
        {...props}
      />
      <button
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-[8px] text-[color:var(--color-text-tertiary)] transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)]"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible
          ? <EyeOff aria-hidden="true" className="size-4" />
          : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  )
}

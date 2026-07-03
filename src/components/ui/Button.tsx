import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { Spinner } from '../feedback/Spinner'
import { getButtonClassName, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({
  children,
  className,
  disabled,
  loading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      aria-busy={loading || undefined}
      className={getButtonClassName(variant, className)}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? <Spinner className="text-current" size="sm" /> : null}
      {children}
    </button>
  )
}

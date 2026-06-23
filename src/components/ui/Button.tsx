import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { getButtonClassName, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={getButtonClassName(variant, className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

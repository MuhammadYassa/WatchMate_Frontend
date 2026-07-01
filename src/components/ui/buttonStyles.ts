import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    'border border-white/10 bg-transparent text-[color:var(--color-text-secondary)] hover:border-white/18 hover:bg-white/[0.05] hover:text-white',
  icon:
    'size-11 rounded-[var(--radius-control)] border border-white/10 bg-[rgba(255,255,255,0.04)] px-0 py-0 text-[color:var(--color-text-primary)] hover:border-white/18 hover:bg-white/[0.08]',
  primary:
    'motion-btn-primary bg-[color:var(--color-action)] text-[color:var(--color-action-ink)] shadow-[0_8px_20px_var(--color-action-glow)] hover:brightness-[1.06] hover:shadow-[0_12px_28px_var(--color-action-glow)]',
  secondary:
    'border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-text-primary)] hover:border-white/18 hover:bg-[rgba(255,255,255,0.07)]',
}

export function getButtonClassName(variant: ButtonVariant = 'primary', className?: string) {
  return cn(
    'inline-flex min-h-11 select-none items-center justify-center rounded-[var(--radius-control)] px-5 py-2.5 text-sm font-semibold tracking-[0.01em] touch-manipulation transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] active:duration-[120ms]',
    variantClasses[variant],
    className,
  )
}

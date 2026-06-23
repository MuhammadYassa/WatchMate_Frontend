import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    'border border-white/8 bg-transparent text-[color:var(--color-text-secondary)] hover:border-white/18 hover:bg-white/6 hover:text-white',
  icon:
    'size-11 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-0 py-0 text-[color:var(--color-text-primary)] hover:border-white/18 hover:bg-white/8',
  primary:
    'border border-white/10 bg-[color:var(--color-accent)] text-[#122f5f] shadow-[0_0_24px_var(--color-accent-glow)] hover:bg-[color:var(--color-accent-strong)]',
  secondary:
    'border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-text-primary)] hover:border-white/18 hover:bg-[rgba(255,255,255,0.08)]',
}

export function getButtonClassName(variant: ButtonVariant = 'primary', className?: string) {
  return cn(
    'inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold tracking-[0.01em] transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    className,
  )
}

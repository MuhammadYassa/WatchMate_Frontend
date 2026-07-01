import { LogoMark } from '../branding/Logo'
import { cn } from '../../utils/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<SpinnerSize, number> = {
  sm: 14,
  md: 20,
  lg: 32,
}

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

export function Spinner({ size = 'sm', className }: SpinnerProps) {
  return (
    <LogoMark
      className={cn('motion-spin text-[color:var(--color-accent)]', className)}
      size={SIZE_MAP[size]}
    />
  )
}

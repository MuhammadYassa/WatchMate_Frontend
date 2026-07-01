import { cn } from '../../utils/cn'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  layout?: 'inline' | 'split'
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  layout = 'inline',
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const previousButton = (
    <Button
      disabled={disabled || page <= 0}
      onClick={() => onPageChange(Math.max(0, page - 1))}
      variant="ghost"
    >
      Previous
    </Button>
  )

  const nextButton = (
    <Button
      disabled={disabled || page >= totalPages - 1}
      onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
      variant="ghost"
    >
      Next
    </Button>
  )

  const label = (
    <p className="text-sm text-[color:var(--color-text-secondary)]">
      Page {page + 1} of {totalPages}
    </p>
  )

  if (layout === 'split') {
    return (
      <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
        {label}
        <div className="flex gap-3">
          {previousButton}
          {nextButton}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {previousButton}
      {label}
      {nextButton}
    </div>
  )
}

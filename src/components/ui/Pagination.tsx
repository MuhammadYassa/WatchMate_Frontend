import { ChevronLeft, ChevronRight } from 'lucide-react'

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
      aria-label="Previous page"
      disabled={disabled || page <= 0}
      onClick={() => onPageChange(Math.max(0, page - 1))}
      variant="ghost"
    >
      <ChevronLeft aria-hidden="true" className="size-4 sm:-ml-1" />
      <span className="hidden sm:inline">Previous</span>
    </Button>
  )

  const nextButton = (
    <Button
      aria-label="Next page"
      disabled={disabled || page >= totalPages - 1}
      onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
      variant="ghost"
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight aria-hidden="true" className="size-4 sm:-mr-1" />
    </Button>
  )

  const label = (
    <p className="text-sm tabular-nums text-[color:var(--color-text-secondary)]">
      Page {page + 1} of {totalPages}
    </p>
  )

  if (layout === 'split') {
    return (
      <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
        {label}
        <div className="flex gap-3">
          {previousButton}
          {nextButton}
        </div>
      </nav>
    )
  }

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-3', className)}>
      {previousButton}
      {label}
      {nextButton}
    </nav>
  )
}

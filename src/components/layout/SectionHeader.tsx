import type { ReactNode } from 'react'

interface SectionHeaderProps {
  action?: ReactNode
  eyebrow?: string
  title: string
}

export function SectionHeader({ action, eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="wm-section-heading flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="break-words font-display text-[1.55rem] leading-tight tracking-[-0.04em] text-white sm:text-[1.95rem] md:text-[2.5rem]">
          {title}
        </h2>
      </div>
      {action ? <div className="w-full sm:w-auto sm:flex-none">{action}</div> : null}
    </div>
  )
}

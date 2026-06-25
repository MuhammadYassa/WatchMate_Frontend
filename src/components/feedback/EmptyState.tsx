import type { ReactNode } from 'react'

import { Card } from '../ui/Card'

interface EmptyStateProps {
  action?: ReactNode
  body: string
  heading: string
  icon: ReactNode
}

export function EmptyState({ action, body, heading, icon }: EmptyStateProps) {
  return (
    <Card className="motion-scale-in flex flex-col items-start gap-5 bg-[rgba(255,255,255,0.025)] p-6 md:p-8">
      <div className="flex size-14 items-center justify-center rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-accent)]">
        {icon}
      </div>
      <div className="space-y-3">
        <h2 className="font-display text-[2rem] tracking-[-0.03em] text-white">{heading}</h2>
        <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">{body}</p>
      </div>
      {action}
    </Card>
  )
}

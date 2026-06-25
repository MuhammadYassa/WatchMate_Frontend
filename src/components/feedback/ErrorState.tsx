import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Card } from '../ui/Card'

interface ErrorStateProps {
  action?: ReactNode
  body?: string
  heading?: string
}

export function ErrorState({
  action,
  body = 'Something went wrong. Check your connection and try again.',
  heading = "Couldn't load this section",
}: ErrorStateProps) {
  return (
    <Card className="motion-scale-in flex flex-col items-start gap-5 border-[rgba(255,180,171,0.2)] bg-[rgba(147,0,10,0.14)] p-6 md:p-8">
      <div className="flex size-14 items-center justify-center rounded-[14px] border border-[rgba(255,180,171,0.2)] bg-[rgba(255,180,171,0.08)] text-[color:var(--color-error)]">
        <AlertTriangle aria-hidden="true" className="size-5" />
      </div>
      <div className="space-y-3">
        <h2 className="font-display text-[2rem] tracking-[-0.03em] text-white">{heading}</h2>
        <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">{body}</p>
      </div>
      {action}
    </Card>
  )
}

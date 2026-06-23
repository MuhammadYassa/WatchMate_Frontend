import type { PropsWithChildren, ReactNode } from 'react'

interface FormFieldProps {
  error?: string | null
  hint?: string
  label: string
  trailing?: ReactNode
}

export function FormField({ children, error, hint, label, trailing }: PropsWithChildren<FormFieldProps>) {
  return (
    <label className="block space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
          {label}
        </span>
        {trailing}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-[color:var(--color-error)]">{error}</p>
      ) : hint ? (
        <p className="text-sm text-[color:var(--color-text-tertiary)]">{hint}</p>
      ) : null}
    </label>
  )
}

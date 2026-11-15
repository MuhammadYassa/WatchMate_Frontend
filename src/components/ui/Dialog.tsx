import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { cn } from '../../utils/cn'
import { prefersReducedMotion } from '../../utils/motion'

type DialogSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

interface DialogProps {
  open: boolean
  onClose: () => void
  eyebrow?: string
  title?: ReactNode
  description?: ReactNode
  size?: DialogSize
  children?: ReactNode
  footer?: ReactNode
  headerActions?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  eyebrow,
  title,
  description,
  size = 'md',
  children,
  footer,
  headerActions,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialogEl = dialogRef.current
    if (!dialogEl) {
      return
    }

    if (open && !dialogEl.open) {
      setClosing(false)
      dialogEl.showModal()
      return
    }

    if (!open && dialogEl.open) {
      if (prefersReducedMotion()) {
        dialogEl.close()
        return
      }

      // Let the panel and backdrop animate out before the native close.
      // The closing flag must flip in this effect: it reacts to the `open`
      // prop while the native dialog is still showing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClosing(true)
      const timer = window.setTimeout(() => {
        dialogEl.close()
        setClosing(false)
      }, 150)
      return () => {
        window.clearTimeout(timer)
        setClosing(false)
      }
    }
  }, [open])

  useEffect(() => {
    const dialogEl = dialogRef.current
    if (!dialogEl) {
      return
    }

    function handleNativeClose() {
      onClose()
    }

    // Route Esc through onClose so the exit animation plays
    function handleCancel(event: Event) {
      event.preventDefault()
      onClose()
    }

    dialogEl.addEventListener('close', handleNativeClose)
    dialogEl.addEventListener('cancel', handleCancel)
    return () => {
      dialogEl.removeEventListener('close', handleNativeClose)
      dialogEl.removeEventListener('cancel', handleCancel)
    }
  }, [onClose])

  const hasHeader = Boolean(eyebrow || title || description || headerActions)

  return (
    <dialog
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      data-size={size}
      className="wm-dialog motion-modal m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-[var(--radius-panel)] border border-white/10 bg-[color:var(--color-surface-glass-strong)] text-[color:var(--color-text-primary)] shadow-[0_32px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl"
      data-closing={closing ? 'true' : undefined}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose()
        }
      }}
      ref={dialogRef}
    >
      {open || closing ? (
        <div className={cn('mx-auto p-6 sm:p-7', SIZE_CLASSES[size], className)}>
          {hasHeader ? (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2.5">
                {eyebrow ? (
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <h2 id={titleId} className="break-words font-display text-3xl tracking-[-0.03em] text-white sm:text-4xl">{title}</h2>
                ) : null}
                {description ? (
                  <p id={descriptionId} className="text-sm leading-7 text-[color:var(--color-text-secondary)]">{description}</p>
                ) : null}
              </div>
              {headerActions}
            </div>
          ) : null}
          {children ? <div className={hasHeader ? 'mt-6' : undefined}>{children}</div> : null}
          {footer ? <div className="mt-6 flex flex-col gap-3 sm:flex-row">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  )
}

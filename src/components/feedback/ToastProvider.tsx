import { useCallback, useMemo, useState, type PropsWithChildren } from 'react'

import { ToastContext } from './toastContext'

interface Toast {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = crypto.randomUUID()

    setToasts((current) => [...current.slice(-2), { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Polite live region — success and info announcements */}
      <div aria-atomic="true" aria-live="polite" className="sr-only" role="status">
        {toasts
          .filter((t) => t.tone !== 'error')
          .map((t) => (
            <p key={t.id}>{t.message}</p>
          ))}
      </div>
      {/* Assertive live region — error announcements interrupt the screen reader */}
      <div aria-atomic="true" aria-live="assertive" className="sr-only" role="alert">
        {toasts
          .filter((t) => t.tone === 'error')
          .map((t) => (
            <p key={t.id}>{t.message}</p>
          ))}
      </div>
      {/* Visual-only container — aria-hidden because content is covered by the live regions above */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex w-full max-w-sm flex-col gap-3 px-4 sm:bottom-6 sm:left-auto sm:right-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'motion-toast rounded-[14px] border px-4 py-3.5 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-200 ease-out',
              toast.tone === 'error'
                ? 'border-[rgba(255,180,171,0.28)] bg-[rgba(147,0,10,0.72)] text-white'
                : toast.tone === 'success'
                  ? 'border-[rgba(111,209,168,0.28)] bg-[rgba(23,81,60,0.85)] text-white'
                  : 'border-white/10 bg-[color:var(--color-surface-glass-strong)] text-[color:var(--color-text-primary)]',
            ].join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

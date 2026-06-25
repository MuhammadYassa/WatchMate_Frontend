import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { Button } from '../ui/Button'

export function SessionExpiredModal() {
  const clearSessionExpired = useAuthStore((state) => state.clearSessionExpired)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const navigate = useNavigate()

  if (!sessionExpired) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-8">
      <div className="motion-modal w-full max-w-md rounded-[18px] border border-white/10 bg-[color:var(--color-surface-glass-strong)] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:p-7">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
            Session ended
          </p>
          <h2 className="font-display text-4xl tracking-[-0.03em] text-white">Log back in to keep going.</h2>
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Your session has ended. Log back in when you're ready to keep tracking what you watch.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="sm:flex-1" onClick={clearSessionExpired} variant="ghost">
            Dismiss
          </Button>
          <Button
            className="sm:flex-1"
            onClick={() => {
              clearSessionExpired()
              navigate('/login')
            }}
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  )
}

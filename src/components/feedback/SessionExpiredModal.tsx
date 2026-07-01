import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'

export function SessionExpiredModal() {
  const clearSessionExpired = useAuthStore((state) => state.clearSessionExpired)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const navigate = useNavigate()

  return (
    <Dialog
      description="Your session has ended. Log back in when you're ready to keep tracking what you watch."
      eyebrow="Session ended"
      footer={
        <>
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
        </>
      }
      onClose={clearSessionExpired}
      open={sessionExpired}
      size="sm"
      title="Log back in to keep going."
    />
  )
}

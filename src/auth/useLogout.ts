import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { authApi } from '../api/authApi'
import { useAuthStore } from './authStore'

/**
 * Revokes the refresh token server-side, then always clears the local
 * session — even if the network call fails (offline, already-revoked token).
 * A user must never end up stuck signed in because the revoke call errored.
 */
export function useLogout() {
  const navigate = useNavigate()
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function logout() {
    setIsLoggingOut(true)
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      // Ignored — the local session clears regardless of the server result.
    } finally {
      clearAuth()
      setIsLoggingOut(false)
      navigate('/')
    }
  }

  return { isLoggingOut, logout }
}

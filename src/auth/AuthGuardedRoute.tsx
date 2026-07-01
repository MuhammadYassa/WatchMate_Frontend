import { Navigate } from 'react-router-dom'

import { useAuthStore } from './authStore'

export function AuthGuardedRoute({ element }: { element: React.ReactElement }) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  return isAuthenticated ? <Navigate replace to="/home" /> : element
}

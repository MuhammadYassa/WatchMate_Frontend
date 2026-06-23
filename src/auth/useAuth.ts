import { useAuthStore } from './authStore'

export function useAuth() {
  return useAuthStore((state) => ({
    accessToken: state.accessToken,
    accessTokenExpiry: state.accessTokenExpiry,
    refreshToken: state.refreshToken,
    sessionExpired: state.sessionExpired,
    tokenType: state.tokenType,
    username: state.username,
  }))
}

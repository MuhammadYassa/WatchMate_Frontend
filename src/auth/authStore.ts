import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LoginResponseDTO } from '../types/api'
import { getJwtSubject } from '../utils/jwt'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  accessTokenExpiry: string
  tokenType: string
}

interface AuthState extends Partial<AuthTokens> {
  username: string | null
  sessionExpired: boolean
  setAuth: (tokens: LoginResponseDTO, username?: string | null) => void
  clearAuth: () => void
  markSessionExpired: () => void
  clearSessionExpired: () => void
  hydrateIdentity: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpiry: undefined,
      tokenType: undefined,
      username: null,
      sessionExpired: false,
      setAuth: (tokens, username) =>
        set({
          ...tokens,
          username: username ?? getJwtSubject(tokens.accessToken) ?? get().username,
          sessionExpired: false,
        }),
      clearAuth: () =>
        set({
          accessToken: undefined,
          refreshToken: undefined,
          accessTokenExpiry: undefined,
          tokenType: undefined,
          username: null,
        }),
      markSessionExpired: () => set({ sessionExpired: true }),
      clearSessionExpired: () => set({ sessionExpired: false }),
      hydrateIdentity: () => {
        const state = get()
        if (!state.username && state.accessToken) {
          set({ username: getJwtSubject(state.accessToken) })
        }
      },
    }),
    {
      name: 'watchmate-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiry: state.accessTokenExpiry,
        tokenType: state.tokenType,
        username: state.username,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateIdentity()
      },
    },
  ),
)

export const authStore = {
  getState: useAuthStore.getState,
  subscribe: useAuthStore.subscribe,
}

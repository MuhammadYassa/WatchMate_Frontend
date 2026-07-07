import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authApi } from '../api/authApi'
import { useAuthStore } from '../auth/authStore'
import { useLogout } from '../auth/useLogout'

vi.mock('../api/authApi', () => ({
  authApi: {
    logout: vi.fn(),
  },
}))

const mockedAuthApi = vi.mocked(authApi)

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-20T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })
  })

  it('revokes the refresh token and clears the local session', async () => {
    mockedAuthApi.logout.mockResolvedValueOnce('Logged out successfully')

    const { result } = renderHook(() => useLogout(), { wrapper: MemoryRouter })

    await act(async () => {
      await result.current.logout()
    })

    expect(mockedAuthApi.logout).toHaveBeenCalledWith({ refreshToken: 'refresh-token' })
    expect(useAuthStore.getState().accessToken).toBeUndefined()
    expect(useAuthStore.getState().refreshToken).toBeUndefined()
    expect(useAuthStore.getState().username).toBeNull()
  })

  it('still clears the local session when the revoke call fails', async () => {
    mockedAuthApi.logout.mockRejectedValueOnce(new Error('network error'))

    const { result } = renderHook(() => useLogout(), { wrapper: MemoryRouter })

    await act(async () => {
      await result.current.logout()
    })

    expect(mockedAuthApi.logout).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().accessToken).toBeUndefined()
  })

  it('clears the session without calling the API when there is no refresh token', async () => {
    useAuthStore.setState({ refreshToken: undefined })

    const { result } = renderHook(() => useLogout(), { wrapper: MemoryRouter })

    await act(async () => {
      await result.current.logout()
    })

    expect(mockedAuthApi.logout).not.toHaveBeenCalled()
    expect(useAuthStore.getState().accessToken).toBeUndefined()
  })
})

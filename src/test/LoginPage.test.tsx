import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { LoginPage } from '../pages/LoginPage'
import { useAuthStore } from '../auth/authStore'
import { renderWithProviders } from './renderWithProviders'
import type { LoginResponseDTO } from '../types/api'

const loginMock = vi.fn()

vi.mock('../api/authApi', () => ({
  authApi: {
    login: (...args: unknown[]) => loginMock(...args),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: undefined,
      accessTokenExpiry: undefined,
      refreshToken: undefined,
      sessionExpired: false,
      tokenType: undefined,
      username: null,
    })
  })

  it('stores tokens and username, then redirects to returnTo', async () => {
    const tokens: LoginResponseDTO = {
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-20T12:00:00',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
    }

    loginMock.mockResolvedValueOnce(tokens)

    renderWithProviders(
      <MemoryRouter initialEntries={['/login?returnTo=%2Fdiscover']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/discover" element={<div>Discover destination</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
      target: { value: 'cinephile' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'Password1!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(screen.getByText('Discover destination')).toBeInTheDocument()
    })

    expect(useAuthStore.getState().username).toBe('cinephile')
    expect(useAuthStore.getState().accessToken).toBe('access-token')
    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(loginMock.mock.calls[0]?.[0]).toEqual({
      password: 'Password1!',
      username: 'cinephile',
    })
  })
})

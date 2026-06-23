import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authApi } from '../api/authApi'
import { apiClient } from '../api/client'
import type { LoginResponseDTO } from '../types/api'

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns token DTOs for login', async () => {
    const tokens: LoginResponseDTO = {
      accessToken: 'access',
      accessTokenExpiry: '2026-06-20T12:00:00',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
    }

    mockedApiClient.post.mockResolvedValueOnce({
      data: tokens,
      headers: new Headers(),
      status: 200,
    })

    const result = await authApi.login({ password: 'secret', username: 'watchmate' })

    expect(result).toEqual(tokens)
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
      body: { password: 'secret', username: 'watchmate' },
      skipAuth: true,
    })
  })

  it('returns raw text for register, verify, resend, and logout', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({
        data: 'Registration successful',
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: 'Verification email sent',
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: 'Logged out',
        headers: new Headers(),
        status: 200,
      })

    mockedApiClient.get.mockResolvedValueOnce({
      data: 'Email verified successfully',
      headers: new Headers(),
      status: 200,
    })

    await expect(
      authApi.register({ email: 'viewer@example.com', password: 'Password1!', username: 'viewer' }),
    ).resolves.toBe('Registration successful')
    await expect(authApi.verifyEmail('verify-token')).resolves.toBe('Email verified successfully')
    await expect(authApi.resendVerification('viewer@example.com')).resolves.toBe(
      'Verification email sent',
    )
    await expect(authApi.logout({ refreshToken: 'refresh-token' })).resolves.toBe('Logged out')
  })
})

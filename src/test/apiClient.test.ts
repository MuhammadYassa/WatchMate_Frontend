import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../api/client'
import { ApiClientError } from '../types/errors'
import type { LoginResponseDTO } from '../types/api'

const nextTokens: LoginResponseDTO = {
  accessToken: 'next-access',
  accessTokenExpiry: '2026-06-20T12:00:00',
  refreshToken: 'next-refresh',
  tokenType: 'Bearer',
}

function createMockAuth() {
  return {
    clearAuth: vi.fn(),
    getAccessToken: vi.fn(() => 'access-token'),
    getRefreshToken: vi.fn(() => 'refresh-token'),
    getUsername: vi.fn(() => 'watchmate-user'),
    markSessionExpired: vi.fn(),
    setAuth: vi.fn(),
  }
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('parses JSON responses', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ items: [{ id: 1 }] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )

    const client = createApiClient('http://localhost:8080/api/v1', fetchMock, createMockAuth())
    const result = await client.get<{ items: Array<{ id: number }> }>('/dashboard/continue-watching')

    expect(result.data.items).toHaveLength(1)
    expect(result.status).toBe(200)
  })

  it('parses raw text responses', async () => {
    const fetchMock = vi.fn(async () => new Response('Email verified successfully', { status: 200 }))
    const client = createApiClient('http://localhost:8080/api/v1', fetchMock, createMockAuth())

    const result = await client.get<string>('/auth/verify?token=abc', {
      skipAuth: true,
    })

    expect(result.data).toBe('Email verified successfully')
  })

  it('normalizes backend errors', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'VALIDATION_ERROR',
          fields: [{ field: 'username', message: 'Username required' }],
          message: 'Validation failed',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      ),
    )

    const client = createApiClient('http://localhost:8080/api/v1', fetchMock, createMockAuth())

    await expect(client.post('/auth/register', { body: { username: '' }, skipAuth: true })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      fields: [{ field: 'username', message: 'Username required' }],
      message: 'Validation failed',
      status: 400,
    })
  })

  it('refreshes once and retries the original request', async () => {
    const auth = createMockAuth()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'AUTH_FAILED', message: 'Authentication failed' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(nextTokens), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      )

    const client = createApiClient('http://localhost:8080/api/v1', fetchMock, auth)
    const result = await client.get<{ items: unknown[] }>('/dashboard/continue-watching')

    expect(result.data.items).toEqual([])
    expect(auth.setAuth).toHaveBeenCalledWith(nextTokens, 'watchmate-user')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('clears auth and marks the session expired when refresh fails', async () => {
    const auth = createMockAuth()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'AUTH_FAILED', message: 'Authentication failed' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token invalid' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }),
      )

    const client = createApiClient('http://localhost:8080/api/v1', fetchMock, auth)

    await expect(client.get('/dashboard/continue-watching')).rejects.toBeInstanceOf(ApiClientError)
    expect(auth.clearAuth).toHaveBeenCalledTimes(1)
    expect(auth.markSessionExpired).toHaveBeenCalledTimes(1)
  })
})

import type { LoginResponseDTO } from '../types/api'
import { ApiClientError, type ApiErrorResponse, type FieldValidationError } from '../types/errors'
import { authStore } from '../auth/authStore'
import { getJwtSubject } from '../utils/jwt'

export interface ApiResult<T> {
  data: T
  headers: Headers
  status: number
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: BodyInit | object | null
  headers?: HeadersInit
  skipAuth?: boolean
  retryOnUnauthorized?: boolean
}

interface AuthAdapter {
  clearAuth: () => void
  getAccessToken: () => string | undefined
  getRefreshToken: () => string | undefined
  getUsername: () => string | null
  markSessionExpired: () => void
  setAuth: (tokens: LoginResponseDTO, username?: string | null) => void
}

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

function createDefaultAuthAdapter(): AuthAdapter {
  return {
    clearAuth: () => authStore.getState().clearAuth(),
    getAccessToken: () => authStore.getState().accessToken,
    getRefreshToken: () => authStore.getState().refreshToken,
    getUsername: () => authStore.getState().username,
    markSessionExpired: () => authStore.getState().markSessionExpired(),
    setAuth: (tokens, username) => authStore.getState().setAuth(tokens, username),
  }
}

function isJsonContentType(contentType: string | null) {
  return contentType?.includes('application/json') ?? false
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function parseBody(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type')
  if (isJsonContentType(contentType)) {
    return response.json()
  }

  const text = await response.text()
  return text.length === 0 ? undefined : text
}

function normalizeErrorBody(status: number, payload: unknown) {
  if (isPlainObject(payload) && typeof payload.message === 'string') {
    const fields = Array.isArray(payload.fields)
      ? (payload.fields as FieldValidationError[])
      : []

    return {
      status,
      message: payload.message,
      code: typeof payload.code === 'string' ? payload.code : 'REQUEST_FAILED',
      fields,
    }
  }

  if (typeof payload === 'string') {
    return {
      status,
      message: payload,
      code: 'REQUEST_FAILED',
      fields: [],
    }
  }

  return {
    status,
    message: 'Something went wrong. Check your connection and try again.',
    code: 'REQUEST_FAILED',
    fields: [],
  }
}

function normalizeRequestBody(body: ApiRequestOptions['body'], headers: Headers) {
  if (!body) {
    return undefined
  }

  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

export function createApiClient(
  baseUrl = defaultBaseUrl,
  fetchImpl: typeof fetch = fetch,
  auth = createDefaultAuthAdapter(),
) {
  let refreshPromise: Promise<LoginResponseDTO | null> | null = null

  async function refreshTokens() {
    if (refreshPromise) {
      return refreshPromise
    }

    const refreshToken = auth.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    refreshPromise = (async () => {
      const response = await fetchImpl(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const payload = (await parseBody(response)) as LoginResponseDTO | ApiErrorResponse | string

      if (!response.ok) {
        auth.clearAuth()
        auth.markSessionExpired()
        throw new ApiClientError(normalizeErrorBody(response.status, payload))
      }

      const nextTokens = payload as LoginResponseDTO
      auth.setAuth(nextTokens, auth.getUsername() ?? getJwtSubject(nextTokens.accessToken))
      return nextTokens
    })()

    try {
      return await refreshPromise
    } finally {
      refreshPromise = null
    }
  }

  async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
    const headers = new Headers(options.headers)
    const shouldRetry = options.retryOnUnauthorized ?? true
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`
    const token = auth.getAccessToken()

    if (!options.skipAuth && token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetchImpl(url, {
      ...options,
      headers,
      body: normalizeRequestBody(options.body ?? null, headers),
    })

    if (
      response.status === 401 &&
      shouldRetry &&
      !options.skipAuth &&
      path !== '/auth/refresh'
    ) {
      try {
        const refreshed = await refreshTokens()
        if (refreshed) {
          return request<T>(path, {
            ...options,
            retryOnUnauthorized: false,
          })
        }
      } catch (error) {
        if (error instanceof ApiClientError) {
          throw error
        }
      }
    }

    const payload = (await parseBody(response)) as T | ApiErrorResponse | string | undefined

    if (!response.ok) {
      throw new ApiClientError(normalizeErrorBody(response.status, payload))
    }

    return {
      data: payload as T,
      headers: response.headers,
      status: response.status,
    }
  }

  return {
    delete: <T>(path: string, options?: ApiRequestOptions) =>
      request<T>(path, { ...options, method: 'DELETE' }),
    get: <T>(path: string, options?: ApiRequestOptions) =>
      request<T>(path, { ...options, method: 'GET' }),
    patch: <T>(path: string, options?: ApiRequestOptions) =>
      request<T>(path, { ...options, method: 'PATCH' }),
    post: <T>(path: string, options?: ApiRequestOptions) =>
      request<T>(path, { ...options, method: 'POST' }),
    put: <T>(path: string, options?: ApiRequestOptions) =>
      request<T>(path, { ...options, method: 'PUT' }),
    request,
  }
}

export const apiClient = createApiClient()

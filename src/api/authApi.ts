import { apiClient } from './client'
import type {
  LoginRequestDTO,
  LoginResponseDTO,
  LogoutRequestDTO,
  RefreshTokenRequestDTO,
  RegisterRequestDTO,
} from '../types/api'

export const authApi = {
  login: async (body: LoginRequestDTO) => {
    const result = await apiClient.post<LoginResponseDTO>('/auth/login', { body, skipAuth: true })
    return result.data
  },
  logout: async (body: LogoutRequestDTO) => {
    const result = await apiClient.post<string>('/auth/logout', { body })
    return result.data
  },
  refresh: async (body: RefreshTokenRequestDTO) => {
    const result = await apiClient.post<LoginResponseDTO>('/auth/refresh', {
      body,
      retryOnUnauthorized: false,
      skipAuth: true,
    })
    return result.data
  },
  register: async (body: RegisterRequestDTO) => {
    const result = await apiClient.post<string>('/auth/register', { body, skipAuth: true })
    return result.data
  },
  resendVerification: async (email: string) => {
    const result = await apiClient.post<string>(
      `/auth/verify/resend?email=${encodeURIComponent(email)}`,
      { skipAuth: true },
    )
    return result.data
  },
  verifyEmail: async (token: string) => {
    const result = await apiClient.get<string>(`/auth/verify?token=${encodeURIComponent(token)}`, {
      skipAuth: true,
    })
    return result.data
  },
}

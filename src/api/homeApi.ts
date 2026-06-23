import { apiClient } from './client'
import type { HomeResponseDTO } from '../types/api'

export const homeApi = {
  getHome: async () => {
    const result = await apiClient.get<HomeResponseDTO>('/home', { skipAuth: true })
    return result.data
  },
}

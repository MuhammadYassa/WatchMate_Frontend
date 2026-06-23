import { apiClient } from './client'
import type { PaginatedSearchResponseDTO } from '../types/api'

export const searchApi = {
  searchMedia: async (query: string, page = 1) => {
    const result = await apiClient.get<PaginatedSearchResponseDTO>(
      `/media/search?query=${encodeURIComponent(query)}&page=${page}`,
      { skipAuth: true },
    )
    return result.data
  },
}

import { apiClient } from './client'
import type { GenreBrowseResponseDTO } from '../types/api'

export const genreApi = {
  getGenreMovies: async (genre: string, page = 1, size = 20) => {
    const result = await apiClient.get<GenreBrowseResponseDTO>(
      `/genre/${encodeURIComponent(genre)}/movies?page=${page}&size=${size}`,
      { skipAuth: true },
    )
    return result.data
  },
  getGenreShows: async (genre: string, page = 1, size = 20) => {
    const result = await apiClient.get<GenreBrowseResponseDTO>(
      `/genre/${encodeURIComponent(genre)}/shows?page=${page}&size=${size}`,
      { skipAuth: true },
    )
    return result.data
  },
}

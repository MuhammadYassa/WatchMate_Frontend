import { apiClient } from './client'
import type { MovieDetailsDTO, UserMediaStatusDTO } from '../types/api'
import type { WatchStatus } from '../types/enums'

export const movieApi = {
  getMovieDetails: async (tmdbId: number) => {
    const result = await apiClient.get<MovieDetailsDTO>(`/movies/${tmdbId}`)
    return result.data
  },
  updateMovieStatus: async (tmdbId: number, status: WatchStatus) => {
    const result = await apiClient.put<UserMediaStatusDTO>(`/movies/${tmdbId}/status`, {
      body: { status },
    })
    return result.data
  },
}

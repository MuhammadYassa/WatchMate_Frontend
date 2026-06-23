import { apiClient } from './client'
import type { DiscoveryMediaItemDTO } from '../types/api'

export const discoverApi = {
  getAiringToday: async () => {
    const result = await apiClient.get<DiscoveryMediaItemDTO[]>('/discover/airing-today', {
      skipAuth: true,
    })
    return result.data
  },
  getPopularNow: async () => {
    const result = await apiClient.get<DiscoveryMediaItemDTO[]>('/discover/popular-now', {
      skipAuth: true,
    })
    return result.data
  },
  getRecommendedLater: async () => {
    const result = await apiClient.get<DiscoveryMediaItemDTO[]>('/discover/recommended-later', {
      skipAuth: true,
    })
    return result.data
  },
  getTrendingMovies: async () => {
    const result = await apiClient.get<DiscoveryMediaItemDTO[]>('/discover/trending-movies', {
      skipAuth: true,
    })
    return result.data
  },
  getTrendingShows: async () => {
    const result = await apiClient.get<DiscoveryMediaItemDTO[]>('/discover/trending-shows', {
      skipAuth: true,
    })
    return result.data
  },
  getUpcoming: async () => {
    const result = await apiClient.get<DiscoveryMediaItemDTO[]>('/discover/upcoming', {
      skipAuth: true,
    })
    return result.data
  },
}

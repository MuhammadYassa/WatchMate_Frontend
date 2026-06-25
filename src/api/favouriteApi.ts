import { apiClient } from './client'
import type { FavouriteStatusDTO, MediaDetailsDTO, PageResponse } from '../types/api'

export const favouriteApi = {
  addFavourite: async (tmdbId: number) => {
    const result = await apiClient.post<unknown>(`/favourites/${tmdbId}`)
    return result.data
  },
  getFavouriteStatus: async (tmdbId: number) => {
    const result = await apiClient.get<FavouriteStatusDTO>(`/favourites/${tmdbId}/status`)
    return result.data
  },
  getFavourites: async (page = 0, size = 20) => {
    const result = await apiClient.get<PageResponse<MediaDetailsDTO>>(
      `/favourites?page=${page}&size=${size}`,
    )
    return result.data
  },
  removeFavourite: async (tmdbId: number) => {
    const result = await apiClient.delete<FavouriteStatusDTO>(`/favourites/${tmdbId}`)
    return result.data
  },
}

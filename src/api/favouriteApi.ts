import { apiClient } from './client'
import type { FavouriteStatusDTO, UserFavouritesDTO } from '../types/api'
import type { MediaType } from '../types/enums'

export const favouriteApi = {
  addFavourite: async (tmdbId: number, type: MediaType) => {
    const result = await apiClient.post<unknown>(
      `/favourites/add/${tmdbId}?type=${encodeURIComponent(type)}`,
    )
    return result.data
  },
  checkFavourite: async (tmdbId: number, type: MediaType) => {
    const result = await apiClient.get<FavouriteStatusDTO>(
      `/favourites/check/${tmdbId}?type=${encodeURIComponent(type)}`,
    )
    return result.data
  },
  getAll: async () => {
    const result = await apiClient.get<UserFavouritesDTO>('/favourites/all')
    return result.data
  },
  removeFavourite: async (tmdbId: number, type: MediaType) => {
    const result = await apiClient.delete<FavouriteStatusDTO>(
      `/favourites/remove/${tmdbId}?type=${encodeURIComponent(type)}`,
    )
    return result.data
  },
}

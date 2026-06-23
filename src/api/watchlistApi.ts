import { apiClient } from './client'
import type {
  CreateWatchListDTO,
  RenameWatchListDTO,
  SpringPage,
  WatchListDTO,
} from '../types/api'
import type { MediaType } from '../types/enums'

export const watchlistApi = {
  addItem: async (watchListId: number, tmdbId: number, type: MediaType) => {
    const result = await apiClient.post<WatchListDTO>(
      `/watchlists/${watchListId}/items/${tmdbId}?type=${encodeURIComponent(type)}`,
    )
    return result.data
  },
  createWatchlist: async (body: CreateWatchListDTO) => {
    const result = await apiClient.post<WatchListDTO>('/watchlists', { body })
    return result.data
  },
  deleteWatchlist: async (id: number) => {
    const result = await apiClient.delete<unknown>(`/watchlists/${id}`)
    return result.data
  },
  getWatchlists: async (page = 0, size = 50) => {
    const result = await apiClient.get<SpringPage<WatchListDTO>>(
      `/watchlists?page=${page}&size=${size}`,
    )
    return result.data
  },
  removeItem: async (watchListId: number, tmdbId: number, type: MediaType) => {
    const result = await apiClient.delete<WatchListDTO>(
      `/watchlists/${watchListId}/items/${tmdbId}?type=${encodeURIComponent(type)}`,
    )
    return result.data
  },
  renameWatchlist: async (id: number, body: RenameWatchListDTO) => {
    const result = await apiClient.patch<WatchListDTO>(`/watchlists/${id}`, { body })
    return result.data
  },
}

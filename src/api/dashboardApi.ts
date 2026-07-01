import { apiClient } from './client'
import type {
  CalendarResponseDTO,
  ContinueWatchingResponseDTO,
  PageResponse,
  ToWatchItemDTO,
  UpcomingEpisodesResponseDTO,
} from '../types/api'

export type ToWatchType = 'ALL' | 'MOVIE' | 'SHOW'

export const dashboardApi = {
  getCalendar: async (from: string, to: string) => {
    const result = await apiClient.get<CalendarResponseDTO>(
      `/dashboard/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    )
    return result.data
  },
  getContinueWatching: async (limit = 12) => {
    const result = await apiClient.get<ContinueWatchingResponseDTO>(
      `/dashboard/continue-watching?limit=${limit}`,
    )
    return result.data
  },
  getToWatchItems: async ({
    page = 0,
    size = 20,
    type = 'ALL',
  }: { page?: number; size?: number; type?: ToWatchType } = {}) => {
    const result = await apiClient.get<PageResponse<ToWatchItemDTO>>(
      `/dashboard/to-watch?page=${page}&size=${size}&type=${type}`,
    )
    return result.data
  },
  getUpcomingEpisodes: async () => {
    const result = await apiClient.get<UpcomingEpisodesResponseDTO>('/dashboard/upcoming-episodes')
    return result.data
  },
}

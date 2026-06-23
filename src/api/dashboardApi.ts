import { apiClient } from './client'
import type {
  CalendarResponseDTO,
  ContinueWatchingResponseDTO,
  UpcomingEpisodesResponseDTO,
} from '../types/api'

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
  getUpcomingEpisodes: async () => {
    const result = await apiClient.get<UpcomingEpisodesResponseDTO>('/dashboard/upcoming-episodes')
    return result.data
  },
}

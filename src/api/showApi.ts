import { apiClient, type ApiResult } from './client'
import { ApiClientError } from '../types/errors'
import type {
  NextEpisodeAiringDTO,
  ShowTrackingDTO,
  ShowTrackingJobDTO,
  ShowDetailsDTO,
  ShowSeasonsDetailsDTO,
} from '../types/api'
import type { WatchStatus } from '../types/enums'

export const showApi = {
  getNextEpisode: async (tmdbId: number) => {
    const result = await apiClient.get<NextEpisodeAiringDTO>(`/shows/${tmdbId}/next-episode`)
    return result.data
  },
  getSeasonEpisodes: async (tmdbId: number, seasonNumber: number) => {
    const result = await apiClient.get<ShowSeasonsDetailsDTO>(
      `/shows/${tmdbId}/seasons/${seasonNumber}/episodes`,
    )
    return result.data
  },
  getShowProgress: async (tmdbId: number) => {
    try {
      const result = await apiClient.get<ShowTrackingDTO>(`/shows/${tmdbId}/progress`)
      return result.data
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        return null
      }

      throw error
    }
  },
  getShowDetails: async (tmdbId: number) => {
    const result = await apiClient.get<ShowDetailsDTO>(`/shows/${tmdbId}`)
    return result.data
  },
  getWatchedEpisodes: async (tmdbId: number) => {
    const result = await apiClient.get<ShowTrackingDTO['watchedEpisodes']>(
      `/shows/${tmdbId}/episodes/watched`,
    )
    return result.data
  },
  updateShowProgress: async (
    tmdbId: number,
    input: { watchPositionEpisode: number; watchPositionSeason: number },
  ) => {
    return apiClient.put<ShowTrackingDTO | ShowTrackingJobDTO>(`/shows/${tmdbId}/progress`, {
      body: input,
    }) as Promise<ApiResult<ShowTrackingDTO | ShowTrackingJobDTO>>
  },
  updateShowStatus: async (tmdbId: number, status: WatchStatus) => {
    return apiClient.put<ShowTrackingDTO | ShowTrackingJobDTO>(`/shows/${tmdbId}/status`, {
      body: { status },
    }) as Promise<ApiResult<ShowTrackingDTO | ShowTrackingJobDTO>>
  },
}

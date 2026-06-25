import { apiClient } from './client'
import type {
  CreateReviewRequestDTO,
  PageResponse,
  ReviewResponseDTO,
  UpdateReviewRequestDTO,
} from '../types/api'

export const reviewApi = {
  createReview: async (body: CreateReviewRequestDTO) => {
    const result = await apiClient.post<ReviewResponseDTO>('/reviews', { body })
    return result.data
  },
  deleteReview: async (reviewId: number) => {
    const result = await apiClient.delete<unknown>(`/reviews/${reviewId}`)
    return result.data
  },
  getMovieReviews: async (tmdbId: number, page = 0, size = 20) => {
    const result = await apiClient.get<PageResponse<ReviewResponseDTO>>(
      `/movies/${tmdbId}/reviews?page=${page}&size=${size}`,
    )
    return result.data
  },
  getReview: async (reviewId: number) => {
    const result = await apiClient.get<ReviewResponseDTO>(`/reviews/${reviewId}`)
    return result.data
  },
  getShowReviews: async (tmdbId: number, page = 0, size = 20) => {
    const result = await apiClient.get<PageResponse<ReviewResponseDTO>>(
      `/shows/${tmdbId}/reviews?page=${page}&size=${size}`,
    )
    return result.data
  },
  updateReview: async (reviewId: number, body: UpdateReviewRequestDTO) => {
    const result = await apiClient.patch<ReviewResponseDTO>(`/reviews/${reviewId}`, { body })
    return result.data
  },
}

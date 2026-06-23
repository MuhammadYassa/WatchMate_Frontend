import { apiClient } from './client'
import type {
  CreateReviewRequestDTO,
  ReviewResponseDTO,
  UpdateReviewRequestDTO,
} from '../types/api'

export const reviewApi = {
  createReview: async (body: CreateReviewRequestDTO) => {
    const result = await apiClient.post<ReviewResponseDTO>('/reviews/create', { body })
    return result.data
  },
  deleteReview: async (reviewId: number) => {
    const result = await apiClient.delete<unknown>(`/reviews/${reviewId}`)
    return result.data
  },
  getReview: async (reviewId: number) => {
    const result = await apiClient.get<ReviewResponseDTO>(`/reviews/${reviewId}`)
    return result.data
  },
  updateReview: async (reviewId: number, body: UpdateReviewRequestDTO) => {
    const result = await apiClient.patch<ReviewResponseDTO>(`/reviews/${reviewId}`, { body })
    return result.data
  },
}

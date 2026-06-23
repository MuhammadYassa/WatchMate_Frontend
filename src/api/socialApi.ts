import { apiClient } from './client'
import type {
  FollowRequestDTO,
  FollowRequestResponseDTO,
  FollowStatusDTO,
  SearchListUserDetailsDTO,
  SpringPage,
  UserProfileDTO,
} from '../types/api'

export const socialApi = {
  acceptFollowRequest: async (requestId: number) => {
    const result = await apiClient.post<FollowRequestResponseDTO>(
      `/social/follow-request/${requestId}/accept`,
    )
    return result.data
  },
  cancelFollowRequest: async (requestId: number) => {
    const result = await apiClient.delete<FollowRequestResponseDTO>(
      `/social/follow-request/${requestId}/cancel`,
    )
    return result.data
  },
  followUser: async (userId: number) => {
    const result = await apiClient.post<FollowStatusDTO>(`/social/follow/${userId}`)
    return result.data
  },
  getFollowStatus: async (userId: number) => {
    const result = await apiClient.get<FollowStatusDTO>(`/social/follow-status/${userId}`)
    return result.data
  },
  getProfile: async (username: string) => {
    const result = await apiClient.get<UserProfileDTO>(
      `/social/profile/${encodeURIComponent(username)}`,
    )
    return result.data
  },
  getReceivedFollowRequests: async (page = 0, size = 10) => {
    const result = await apiClient.get<SpringPage<FollowRequestDTO>>(
      `/social/follow-requests/received?page=${page}&size=${size}`,
    )
    return result.data
  },
  rejectFollowRequest: async (requestId: number) => {
    const result = await apiClient.post<FollowRequestResponseDTO>(
      `/social/follow-request/${requestId}/reject`,
    )
    return result.data
  },
  searchUsers: async (query: string) => {
    const result = await apiClient.get<SearchListUserDetailsDTO[]>(
      `/social/search?query=${encodeURIComponent(query)}`,
    )
    return result.data
  },
  toggleBlockUser: async (userId: number) => {
    const result = await apiClient.post<FollowStatusDTO>(`/social/block/${userId}`)
    return result.data
  },
  unfollowUser: async (userId: number) => {
    const result = await apiClient.delete<FollowStatusDTO>(`/social/unfollow/${userId}`)
    return result.data
  },
}

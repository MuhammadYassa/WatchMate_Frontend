import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../api/client'
import { socialApi } from '../api/socialApi'

vi.mock('../api/client', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('socialApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets a profile and follow status', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({
        data: { followStatus: 'NOT_FOLLOWING' },
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: {
          followersCount: 4,
          followStatus: 'NOT_FOLLOWING',
          followingCount: 8,
          privacyStatus: 'PUBLIC',
          userId: 9,
          username: 'cinephile',
        },
        headers: new Headers(),
        status: 200,
      })

    await expect(socialApi.getFollowStatus(9)).resolves.toEqual({ followStatus: 'NOT_FOLLOWING' })
    await expect(socialApi.getProfile('cinephile')).resolves.toMatchObject({
      username: 'cinephile',
      userId: 9,
    })

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, '/social/follow-status/9')
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, '/social/profile/cinephile')
  })

  it('calls follow, unfollow, and block actions', async () => {
    mockedApiClient.post
      .mockResolvedValueOnce({
        data: { followStatus: 'FOLLOWING' },
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: { followStatus: 'BLOCKED' },
        headers: new Headers(),
        status: 200,
      })
    mockedApiClient.delete.mockResolvedValueOnce({
      data: { followStatus: 'NOT_FOLLOWING' },
      headers: new Headers(),
      status: 200,
    })

    await expect(socialApi.followUser(9)).resolves.toEqual({ followStatus: 'FOLLOWING' })
    await expect(socialApi.unfollowUser(9)).resolves.toEqual({ followStatus: 'NOT_FOLLOWING' })
    await expect(socialApi.toggleBlockUser(9)).resolves.toEqual({ followStatus: 'BLOCKED' })

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(1, '/social/follow/9')
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/social/unfollow/9')
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(2, '/social/block/9')
  })

  it('calls follow requests and social search endpoints', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({
        data: { content: [], empty: true, first: true, last: true, number: 0, numberOfElements: 0, size: 10, totalElements: 0, totalPages: 0 },
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: [],
        headers: new Headers(),
        status: 200,
      })
    mockedApiClient.post
      .mockResolvedValueOnce({
        data: { newStatus: 'ACCEPTED', requestId: 3 },
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: { newStatus: 'REJECTED', requestId: 4 },
        headers: new Headers(),
        status: 200,
      })
    mockedApiClient.delete
      .mockResolvedValueOnce({
        data: { newStatus: 'CANCELED', requestId: 5 },
        headers: new Headers(),
        status: 200,
      })

    await expect(socialApi.getReceivedFollowRequests(0, 10)).resolves.toMatchObject({ content: [] })
    await expect(socialApi.acceptFollowRequest(3)).resolves.toEqual({ newStatus: 'ACCEPTED', requestId: 3 })
    await expect(socialApi.rejectFollowRequest(4)).resolves.toEqual({ newStatus: 'REJECTED', requestId: 4 })
    await expect(socialApi.cancelFollowRequest(5)).resolves.toEqual({ newStatus: 'CANCELED', requestId: 5 })
    await expect(socialApi.searchUsers('cine')).resolves.toEqual([])

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, '/social/follow-requests/received?page=0&size=10')
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(1, '/social/follow-request/3/accept')
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(2, '/social/follow-request/4/reject')
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/social/follow-request/5/cancel')
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, '/social/search?query=cine')
  })
})

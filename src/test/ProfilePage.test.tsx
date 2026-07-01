import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { ProfilePage } from '../pages/ProfilePage'
import { renderWithProviders } from './renderWithProviders'
import type { UserProfileDTO } from '../types/api'
import type { FollowStatus, PrivacyStatus } from '../types/enums'

const blockUserMock = vi.fn()
const followUserMock = vi.fn()
const getFollowStatusMock = vi.fn()
const getProfileByUsernameMock = vi.fn()
const unfollowUserMock = vi.fn()
const unblockUserMock = vi.fn()
const updateMyPrivacyStatusMock = vi.fn()

vi.mock('../api/socialApi', () => ({
  socialApi: {
    blockUser: (...args: unknown[]) => blockUserMock(...args),
    followUser: (...args: unknown[]) => followUserMock(...args),
    getFollowStatus: (...args: unknown[]) => getFollowStatusMock(...args),
    getProfileByUsername: (...args: unknown[]) => getProfileByUsernameMock(...args),
    unfollowUser: (...args: unknown[]) => unfollowUserMock(...args),
    unblockUser: (...args: unknown[]) => unblockUserMock(...args),
    updateMyPrivacyStatus: (...args: unknown[]) => updateMyPrivacyStatusMock(...args),
  },
}))

function createProfile({
  followStatus = 'NOT_FOLLOWING' as FollowStatus,
  privacyStatus = 'PUBLIC' as PrivacyStatus,
  username = 'cinephile',
}: {
  followStatus?: FollowStatus
  privacyStatus?: PrivacyStatus
  username?: string
} = {}) {
  return {
    followersCount: 24,
    followStatus,
    followingCount: 13,
    privacyStatus,
    userId: 9,
    username,
  } as UserProfileDTO
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-21T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })
  })

  it('renders a self profile with available sections', async () => {
    getProfileByUsernameMock.mockResolvedValue({
      ...createProfile({ followStatus: 'NOT_FOLLOWING', username: 'viewer' }),
      moviesWatched: {
        content: [
          {
            genres: [],
            id: 603,
            mediaType: 'movie',
            overview: '',
            posterPath: '/matrix.jpg',
            releaseDate: '1999-03-31',
            title: 'The Matrix',
            voteAverage: 8.7,
          },
        ],
        empty: false,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
      moviesWatchedCount: 1,
      reviews: {
        content: [
          {
            comment: 'Still incredible.',
            postedAt: '2026-01-01',
            reviewId: 1,
            starRating: 4.5,
            tmdbId: 603,
            updatedAt: '2026-01-02',
            username: 'viewer',
          },
        ],
        empty: false,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
      showsWatched: {
        content: [],
        empty: true,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      },
      showsWatchedCount: 0,
      watchlists: {
        content: [
          {
            id: 8,
            media: [],
            name: 'Weekend picks',
          },
        ],
        empty: false,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/viewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'viewer' })).toBeInTheDocument()
    })

    expect(screen.getByText('Your watchlists')).toBeInTheDocument()
    expect(screen.getByText('Your reviews')).toBeInTheDocument()
    expect(screen.getByText('Movies you watched')).toBeInTheDocument()
    expect(screen.getAllByText('Weekend picks').length).toBeGreaterThan(0)
    expect(screen.getByText('Still incredible.')).toBeInTheDocument()
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /find people/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /follow requests/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /private profile/i })).toBeInTheDocument()
    expect(screen.getByText(/anyone can view your profile/i)).toBeInTheDocument()
  }, 10000)

  it('hides absent private sections gracefully', async () => {
    getProfileByUsernameMock.mockResolvedValue(
      createProfile({
        followStatus: 'NOT_FOLLOWING',
        privacyStatus: 'PRIVATE',
        username: 'privateviewer',
      }),
    )
    getFollowStatusMock.mockResolvedValue({ followStatus: 'NOT_FOLLOWING' })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/privateviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'privateviewer' })).toBeInTheDocument()
    })

    expect(screen.queryByText('Watchlists')).not.toBeInTheDocument()
    expect(screen.queryByText('Recent reviews')).not.toBeInTheDocument()
    expect(screen.queryByText('Movies watched')).not.toBeInTheDocument()
  })

  it('renders the blocked profile state', async () => {
    getProfileByUsernameMock.mockResolvedValue(
      createProfile({
        followStatus: 'BLOCKED',
        privacyStatus: 'PRIVATE',
        username: 'blockedviewer',
      }),
    )
    getFollowStatusMock.mockResolvedValue({ followStatus: 'BLOCKED' })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/blockedviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('This profile is blocked')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /unblock profile/i })).toBeInTheDocument()
  })

  it('updates to requested when following a private profile returns REQUESTED', async () => {
    const user = userEvent.setup()
    let currentFollowStatus: FollowStatus = 'NOT_FOLLOWING'
    let currentProfile = createProfile({
      followStatus: 'NOT_FOLLOWING',
      privacyStatus: 'PRIVATE',
      username: 'privateviewer',
    })

    getProfileByUsernameMock.mockImplementation(() => Promise.resolve(currentProfile))
    getFollowStatusMock.mockImplementation(() => Promise.resolve({ followStatus: currentFollowStatus }))
    followUserMock.mockImplementation(() => {
      currentFollowStatus = 'REQUESTED'
      currentProfile = { ...currentProfile, followStatus: 'REQUESTED' }
      return Promise.resolve({ followStatus: 'REQUESTED' })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/privateviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /follow/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /requested/i })).toBeInTheDocument()
    })
  })

  it('updates to following when following a public profile returns FOLLOWING', async () => {
    const user = userEvent.setup()
    let currentFollowStatus: FollowStatus = 'NOT_FOLLOWING'
    let currentProfile = createProfile({
      followStatus: 'NOT_FOLLOWING',
      privacyStatus: 'PUBLIC',
      username: 'publicviewer',
    })

    getProfileByUsernameMock.mockImplementation(() => Promise.resolve(currentProfile))
    getFollowStatusMock.mockImplementation(() => Promise.resolve({ followStatus: currentFollowStatus }))
    followUserMock.mockImplementation(() => {
      currentFollowStatus = 'FOLLOWING'
      currentProfile = {
        ...currentProfile,
        followStatus: 'FOLLOWING',
        watchlists: {
          content: [],
          empty: true,
          first: true,
          last: true,
          number: 0,
          numberOfElements: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      }
      return Promise.resolve({ followStatus: 'FOLLOWING' })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/publicviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /follow/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument()
    })
  })

  it('supports unfollowing from a following state', async () => {
    const user = userEvent.setup()
    let currentFollowStatus: FollowStatus = 'FOLLOWING'
    let currentProfile = {
      ...createProfile({
        followStatus: 'FOLLOWING',
        privacyStatus: 'PUBLIC',
        username: 'publicviewer',
      }),
      watchlists: {
        content: [],
        empty: true,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      },
    }

    getProfileByUsernameMock.mockImplementation(() => Promise.resolve(currentProfile))
    getFollowStatusMock.mockImplementation(() => Promise.resolve({ followStatus: currentFollowStatus }))
    unfollowUserMock.mockImplementation(() => {
      currentFollowStatus = 'NOT_FOLLOWING'
      currentProfile = { ...currentProfile, followStatus: 'NOT_FOLLOWING' }
      return Promise.resolve({ followStatus: 'NOT_FOLLOWING' })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/publicviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /following/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^follow$/i })).toBeInTheDocument()
    })
  })

  it('supports blocking a visible profile', async () => {
    const user = userEvent.setup()
    let currentFollowStatus: FollowStatus = 'NOT_FOLLOWING'
    let currentProfile = createProfile({
      followStatus: 'NOT_FOLLOWING',
      privacyStatus: 'PUBLIC',
      username: 'publicviewer',
    })

    getProfileByUsernameMock.mockImplementation(() => Promise.resolve(currentProfile))
    getFollowStatusMock.mockImplementation(() => Promise.resolve({ followStatus: currentFollowStatus }))
    blockUserMock.mockImplementation(() => {
      currentFollowStatus = 'BLOCKED'
      currentProfile = {
        ...currentProfile,
        followersCount: 0,
        followingCount: 0,
        followStatus: 'BLOCKED',
      }
      return Promise.resolve({ followStatus: 'BLOCKED' })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/publicviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /block profile/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /block profile/i }))

    await waitFor(() => {
      expect(screen.getByText('This profile is blocked')).toBeInTheDocument()
    })
  })

  it('lets the self profile update privacy visibility', async () => {
    const user = userEvent.setup()
    let currentProfile = createProfile({
      followStatus: 'SELF',
      privacyStatus: 'PUBLIC',
      username: 'viewer',
    })

    getProfileByUsernameMock.mockImplementation(() => Promise.resolve(currentProfile))
    updateMyPrivacyStatusMock.mockImplementation((privacyStatus: PrivacyStatus) => {
      currentProfile = {
        ...currentProfile,
        privacyStatus,
      }
      return Promise.resolve({ privacyStatus, userId: currentProfile.userId })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/viewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/anyone can view your profile/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /private profile/i }))

    await waitFor(() => {
      expect(updateMyPrivacyStatusMock).toHaveBeenCalledWith('PRIVATE')
    })
  })

  it('supports explicit unblocking for blocked profiles', async () => {
    const user = userEvent.setup()
    let currentFollowStatus: FollowStatus = 'BLOCKED'
    let currentProfile = createProfile({
      followStatus: 'BLOCKED',
      privacyStatus: 'PRIVATE',
      username: 'blockedviewer',
    })

    getProfileByUsernameMock.mockImplementation(() => Promise.resolve(currentProfile))
    getFollowStatusMock.mockImplementation(() => Promise.resolve({ followStatus: currentFollowStatus }))
    unblockUserMock.mockImplementation(() => {
      currentFollowStatus = 'NOT_FOLLOWING'
      currentProfile = {
        ...currentProfile,
        followStatus: 'NOT_FOLLOWING',
      }
      return Promise.resolve({ followStatus: 'NOT_FOLLOWING' })
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/profile/blockedviewer']}>
        <Routes>
          <Route element={<ProfilePage />} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unblock profile/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /unblock profile/i }))

    await waitFor(() => {
      expect(unblockUserMock).toHaveBeenCalledWith(9)
    })
  })
})

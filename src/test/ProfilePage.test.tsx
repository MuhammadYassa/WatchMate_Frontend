import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { ProfilePage } from '../pages/ProfilePage'
import { renderWithProviders } from './renderWithProviders'
import type { SpringPage, UserProfileDTO } from '../types/api'
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
} = {}): UserProfileDTO {
  return {
    followersCount: 24,
    followStatus,
    followingCount: 13,
    privacyStatus,
    userId: 9,
    username,
  } satisfies UserProfileDTO
}

function page<T>(content: T[], number = 0, totalPages = content.length ? 1 : 0): SpringPage<T> {
  return { content, empty: !content.length, first: number === 0, last: number >= totalPages - 1,
    number, numberOfElements: content.length, size: 10, totalElements: content.length * totalPages, totalPages }
}

// Matches retrieveTargetUserProfile: watchlists/counts are supplied; activity
// previews are left unset by the DTO builder and serialize as null.
function publicProfile(): UserProfileDTO {
  return { ...createProfile(), watchlists: page([{ id: 8, name: 'Weekend picks', media: [] }]),
    moviesWatchedCount: 4, showsWatchedCount: 2, reviews: null, moviesWatched: null, showsWatched: null }
}

function populatedProfile(): UserProfileDTO {
  return { ...publicProfile(), reviews: page([{ reviewId: 12, username: 'cinephile', comment: 'A memorable film.',
    starRating: 4, tmdbId: 603, postedAt: '2026-11-01', updatedAt: '2026-11-01' }]),
    moviesWatched: page([{ id: 603, title: 'The Matrix', mediaType: 'movie', overview: '', posterPath: null,
      releaseDate: '1999-03-31', voteAverage: 8.7, genres: [] }]),
    showsWatched: page([{ id: 95396, title: 'Severance', mediaType: 'tv', overview: '', posterPath: null,
      releaseDate: '2022-02-18', voteAverage: 8.7, genres: [] }]) }
}

function renderProfile(username = 'cinephile') {
  return renderWithProviders(<MemoryRouter initialEntries={['/social/profile/' + username]}>
    <Routes><Route element={<ProfilePage />} path="/social/profile/:username" /></Routes>
  </MemoryRouter>)
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getFollowStatusMock.mockResolvedValue({ followStatus: 'NOT_FOLLOWING' })
    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-21T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })
  })

  it('renders another public user with the backend null activity previews', async () => {
    getProfileByUsernameMock.mockResolvedValue(publicProfile())
    renderProfile()
    expect(await screen.findByRole('heading', { name: 'cinephile' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Weekend picks' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recent reviews' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Movies watched' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Shows watched' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Follow' })).toBeEnabled()
    expect(getProfileByUsernameMock).toHaveBeenCalledWith('cinephile')
    expect(getFollowStatusMock).toHaveBeenCalledWith(9)
  })

  it.each(['watchlists', 'reviews', 'moviesWatched', 'showsWatched'] as const)(
    'hides a null %s without hiding other populated sections', async (field) => {
      const headings = { watchlists: 'Watchlists', reviews: 'Recent reviews', moviesWatched: 'Movies watched', showsWatched: 'Shows watched' }
      getProfileByUsernameMock.mockResolvedValue({ ...populatedProfile(), [field]: null })
      renderProfile()
      await screen.findByRole('heading', { name: 'cinephile' })
      for (const key of Object.keys(headings) as (keyof typeof headings)[]) {
        if (key === field) expect(screen.queryByRole('heading', { name: headings[key] })).not.toBeInTheDocument()
        else expect(screen.getByRole('heading', { name: headings[key] })).toBeInTheDocument()
      }
    },
  )

  it.each(['null', 'omitted'] as const)('shows Nothing shared for %s collections, not empty-section messages', async (kind) => {
    getProfileByUsernameMock.mockResolvedValue(kind === 'null'
      ? { ...createProfile(), watchlists: null, reviews: null, moviesWatched: null, showsWatched: null,
        moviesWatchedCount: null, showsWatchedCount: null } : createProfile())
    renderProfile()
    expect(await screen.findByRole('heading', { name: 'Nothing shared yet' })).toBeInTheDocument()
    expect(screen.queryByText('No reviews yet')).not.toBeInTheDocument()
    expect(screen.queryByText('No watchlists yet')).not.toBeInTheDocument()
    expect(screen.queryByText('Movies watched')).not.toBeInTheDocument()
    expect(screen.queryByText('Shows watched')).not.toBeInTheDocument()
  })

  it('renders populated public sections and preserves title links', async () => {
    getProfileByUsernameMock.mockResolvedValue(populatedProfile())
    renderProfile()
    expect(await screen.findByText('A memorable film.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /The Matrix/ })).toHaveAttribute('href', '/movies/603')
    expect(screen.getByRole('link', { name: /Severance/ })).toHaveAttribute('href', '/shows/95396')
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('distinguishes visible empty pages from unavailable collections', async () => {
    getProfileByUsernameMock.mockResolvedValue({ ...createProfile(), watchlists: page([]), reviews: page([]),
      moviesWatched: page([]), showsWatched: page([]), moviesWatchedCount: 0, showsWatchedCount: 0 })
    renderProfile()
    expect(await screen.findByText('No watchlists yet')).toBeInTheDocument()
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
    expect(screen.getAllByText('Nothing here yet')).toHaveLength(2)
    expect(screen.queryByText('Nothing shared yet')).not.toBeInTheDocument()
  })

  it.each(['NOT_FOLLOWING', 'REQUESTED', 'BLOCKED'] as const)('keeps populated sections restricted for %s', async (followStatus) => {
    getProfileByUsernameMock.mockResolvedValue({ ...populatedProfile(), privacyStatus: 'PRIVATE', followStatus })
    getFollowStatusMock.mockResolvedValue({ followStatus })
    renderProfile()
    const heading = followStatus === 'BLOCKED' ? 'This profile is blocked' : followStatus === 'REQUESTED' ? 'Request pending' : 'Private profile'
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    expect(screen.queryByText('Weekend picks')).not.toBeInTheDocument()
    expect(screen.queryByText('A memorable film.')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /The Matrix/ })).not.toBeInTheDocument()
    if (followStatus === 'REQUESTED') expect(screen.getByRole('button', { name: 'Requested' })).toBeDisabled()
  })

  it('renders available sections for a follower of a private profile', async () => {
    getProfileByUsernameMock.mockResolvedValue({ ...publicProfile(), privacyStatus: 'PRIVATE', followStatus: 'FOLLOWING' })
    getFollowStatusMock.mockResolvedValue({ followStatus: 'FOLLOWING' })
    renderProfile()
    expect(await screen.findByRole('heading', { name: 'Weekend picks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Following' })).toBeEnabled()
  })

  it('renders an own profile with unavailable previews and retains privacy/navigation controls', async () => {
    getProfileByUsernameMock.mockResolvedValue({ ...publicProfile(), username: 'viewer', followStatus: 'SELF', watchlists: null })
    renderProfile('viewer')
    expect(await screen.findByRole('heading', { name: 'Nothing shared yet' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /private profile/i })).toBeEnabled()
    expect(screen.getByRole('link', { name: /Find people/ })).toHaveAttribute('href', '/social/search')
    expect(screen.getByRole('link', { name: /Follow requests/ })).toHaveAttribute('href', '/follow-requests')
    expect(getFollowStatusMock).not.toHaveBeenCalled()
  })

  it('keeps the returned paginated preview slice without inventing pages or requests', async () => {
    getProfileByUsernameMock.mockResolvedValue({ ...publicProfile(), watchlists: page([{ id: 9, name: 'Page two list', media: [] }], 1, 3) })
    renderProfile()
    expect(await screen.findByRole('heading', { name: 'Page two list' })).toBeInTheDocument()
    expect(screen.queryByText('Weekend picks')).not.toBeInTheDocument()
    expect(getProfileByUsernameMock).toHaveBeenCalledTimes(1)
    // ProfilePage exposes previews only; there were no profile paging controls.
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument()
  })

  it('renders loading until the profile request resolves', () => {
    getProfileByUsernameMock.mockImplementation(() => new Promise(() => {}))
    const { container } = renderProfile()
    expect(container.querySelector('.wm-profile')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'cinephile' })).not.toBeInTheDocument()
    expect(getFollowStatusMock).not.toHaveBeenCalled()
  })

  it('renders a recoverable error and retries the same profile', async () => {
    const user = userEvent.setup()
    getProfileByUsernameMock.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(publicProfile())
    renderProfile()
    await screen.findByRole('heading', { name: 'Profile unavailable' })
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Weekend picks' })).toBeInTheDocument()
    expect(getProfileByUsernameMock).toHaveBeenCalledTimes(2)
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
    expect(screen.getByRole('switch', { name: /private profile/i })).toBeInTheDocument()
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

    await user.click(screen.getByRole('switch', { name: /private profile/i }))

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

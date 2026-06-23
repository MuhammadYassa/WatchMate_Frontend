import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { useAuthStore } from '../auth/authStore'
import { SocialSearchPage } from '../pages/SocialSearchPage'
import { renderWithProviders } from './renderWithProviders'

const searchUsersMock = vi.fn()

vi.mock('../api/socialApi', () => ({
  socialApi: {
    searchUsers: (...args: unknown[]) => searchUsersMock(...args),
  },
}))

describe('SocialSearchPage', () => {
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

  it('renders the no-query state', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/social/search']}>
        <Routes>
          <Route element={<SocialSearchPage />} path="/social/search" />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Search by username')).toBeInTheDocument()
  })

  it('renders search results and navigates to the selected profile', async () => {
    const user = userEvent.setup()

    searchUsersMock.mockResolvedValue([
      {
        isFollowing: true,
        isSelf: false,
        privacyStatus: 'PUBLIC',
        userId: 9,
        username: 'cinephile',
      },
    ])

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/search?q=cine']}>
        <Routes>
          <Route element={<SocialSearchPage />} path="/social/search" />
          <Route element={<div>Profile destination</div>} path="/social/profile/:username" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(searchUsersMock).toHaveBeenCalledWith('cine')
    })

    await waitFor(() => {
      expect(screen.getByText('cinephile')).toBeInTheDocument()
    })
    expect(screen.getByText('Following')).toBeInTheDocument()

    await user.click(screen.getByText('cinephile'))

    await waitFor(() => {
      expect(screen.getByText('Profile destination')).toBeInTheDocument()
    })
  })

  it('renders the empty results state', async () => {
    searchUsersMock.mockResolvedValue([])

    renderWithProviders(
      <MemoryRouter initialEntries={['/social/search?q=nobody']}>
        <Routes>
          <Route element={<SocialSearchPage />} path="/social/search" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(searchUsersMock).toHaveBeenCalledWith('nobody')
    })

    await waitFor(() => {
      expect(screen.getByText('No matches yet')).toBeInTheDocument()
    })
  })
})

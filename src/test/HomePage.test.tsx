import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'

import { HomePage } from '../pages/HomePage'
import { useAuthStore } from '../auth/authStore'
import { renderWithProviders } from './renderWithProviders'
import type { ContinueWatchingResponseDTO, HomeResponseDTO } from '../types/api'

const getContinueWatchingMock = vi.fn()
const getHomeMock = vi.fn()

vi.mock('../api/homeApi', () => ({
  homeApi: {
    getHome: (...args: unknown[]) => getHomeMock(...args),
  },
}))

vi.mock('../api/dashboardApi', () => ({
  dashboardApi: {
    getContinueWatching: (...args: unknown[]) => getContinueWatchingMock(...args),
  },
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-20T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })
  })

  it('renders rails from home data and the continue watching insert', async () => {
    const homeData: HomeResponseDTO = {
      airingToday: [],
      movieGenres: ['Action', 'Drama'],
      popularNow: [],
      recommendedLater: [],
      showGenres: ['Comedy'],
      trendingMovies: [
        {
          backdropPath: '/movie-backdrop.jpg',
          overview: 'A desert epic.',
          posterPath: '/movie-poster.jpg',
          rating: 8.6,
          releaseDate: '2026-03-01',
          title: 'Dune: Part Two',
          tmdbId: 11,
          type: 'MOVIE',
        },
      ],
      trendingShows: [
        {
          backdropPath: '/show-backdrop.jpg',
          overview: 'A kitchen on the edge.',
          posterPath: '/show-poster.jpg',
          rating: 8.7,
          releaseDate: '2026-01-15',
          title: 'The Bear',
          tmdbId: 22,
          type: 'SHOW',
        },
      ],
      upcoming: [],
    }

    const continueWatching: ContinueWatchingResponseDTO = {
      items: [
        {
          backdropPath: '/resume-backdrop.jpg',
          lastWatchedAt: null,
          nextEpisodeNumber: null,
          nextSeasonNumber: null,
          posterPath: '/resume-poster.jpg',
          rating: 8.3,
          resumeEpisodeNumber: 4,
          resumeSeasonNumber: 2,
          title: 'Severance',
          tmdbId: 33,
          type: 'SHOW',
          updatedAt: null,
          watchStatus: 'WATCHING',
        },
      ],
    }

    getHomeMock.mockResolvedValueOnce(homeData)
    getContinueWatchingMock.mockResolvedValueOnce(continueWatching)

    renderWithProviders(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Trending Movies')).toBeInTheDocument()
    })

    expect(screen.getByText('Continue watching')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view dune: part two/i })).toBeInTheDocument()
    expect(screen.getByText('The Bear')).toBeInTheDocument()
    expect(screen.getByText('Severance')).toBeInTheDocument()
    expect(screen.getByText('Browse movie genres')).toBeInTheDocument()
  })
})

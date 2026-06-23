import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'

import { DiscoverPage } from '../pages/DiscoverPage'
import { renderWithProviders } from './renderWithProviders'
import type { DiscoveryMediaItemDTO, HomeResponseDTO } from '../types/api'

const getAiringTodayMock = vi.fn()
const getGenreMoviesMock = vi.fn()
const getGenreShowsMock = vi.fn()
const getHomeMock = vi.fn()
const getPopularNowMock = vi.fn()
const getRecommendedLaterMock = vi.fn()
const getTrendingMoviesMock = vi.fn()
const getTrendingShowsMock = vi.fn()
const getUpcomingMock = vi.fn()

vi.mock('../api/discoverApi', () => ({
  discoverApi: {
    getAiringToday: (...args: unknown[]) => getAiringTodayMock(...args),
    getPopularNow: (...args: unknown[]) => getPopularNowMock(...args),
    getRecommendedLater: (...args: unknown[]) => getRecommendedLaterMock(...args),
    getTrendingMovies: (...args: unknown[]) => getTrendingMoviesMock(...args),
    getTrendingShows: (...args: unknown[]) => getTrendingShowsMock(...args),
    getUpcoming: (...args: unknown[]) => getUpcomingMock(...args),
  },
}))

vi.mock('../api/genreApi', () => ({
  genreApi: {
    getGenreMovies: (...args: unknown[]) => getGenreMoviesMock(...args),
    getGenreShows: (...args: unknown[]) => getGenreShowsMock(...args),
  },
}))

vi.mock('../api/homeApi', () => ({
  homeApi: {
    getHome: (...args: unknown[]) => getHomeMock(...args),
  },
}))

describe('DiscoverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const homeData: HomeResponseDTO = {
      airingToday: [],
      movieGenres: ['Action', 'Sci-Fi'],
      popularNow: [],
      recommendedLater: [],
      showGenres: ['Comedy'],
      trendingMovies: [],
      trendingShows: [],
      upcoming: [],
    }

    const categoryItems: DiscoveryMediaItemDTO[] = [
      {
        backdropPath: '/poster-backdrop.jpg',
        overview: 'A featured title.',
        posterPath: '/poster.jpg',
        rating: 8.1,
        releaseDate: '2026-03-01',
        title: 'Featured Pick',
        tmdbId: 88,
        type: 'MOVIE',
      },
    ]

    getHomeMock.mockResolvedValue(homeData)
    getTrendingMoviesMock.mockResolvedValue(categoryItems)
    getTrendingShowsMock.mockResolvedValue([])
    getPopularNowMock.mockResolvedValue([])
    getAiringTodayMock.mockResolvedValue([])
    getUpcomingMock.mockResolvedValue([])
    getRecommendedLaterMock.mockResolvedValue([])
    getGenreMoviesMock.mockResolvedValue({
      currentPage: 1,
      genre: 'Action',
      mediaType: 'MOVIE',
      results: [],
      totalPages: 1,
      totalResults: 0,
    })
    getGenreShowsMock.mockResolvedValue({
      currentPage: 1,
      genre: 'Comedy',
      mediaType: 'SHOW',
      results: [],
      totalPages: 1,
      totalResults: 0,
    })
  })

  it('renders the supported discovery categories and category results', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/discover?category=trending-movies']}>
        <DiscoverPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Featured Pick')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Trending Movies' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trending Shows' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Popular Now' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Movie genres' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Show genres' })).toBeInTheDocument()
  })
})

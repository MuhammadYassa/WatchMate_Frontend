import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { MovieDetailPage } from '../pages/MovieDetailPage'
import { renderWithProviders } from './renderWithProviders'
import type { MovieDetailsDTO } from '../types/api'

const getMovieDetailsMock = vi.fn()
const updateMovieStatusMock = vi.fn()
const addFavouriteMock = vi.fn()
const removeFavouriteMock = vi.fn()

vi.mock('../api/movieApi', () => ({
  movieApi: {
    getMovieDetails: (...args: unknown[]) => getMovieDetailsMock(...args),
    updateMovieStatus: (...args: unknown[]) => updateMovieStatusMock(...args),
  },
}))

vi.mock('../api/favouriteApi', () => ({
  favouriteApi: {
    addFavourite: (...args: unknown[]) => addFavouriteMock(...args),
    removeFavourite: (...args: unknown[]) => removeFavouriteMock(...args),
  },
}))

describe('MovieDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: undefined,
      accessTokenExpiry: undefined,
      refreshToken: undefined,
      sessionExpired: false,
      tokenType: undefined,
      username: null,
    })
  })

  it('renders movie details, genres, reviews, and the sign-in prompt', async () => {
    const movie: MovieDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      genres: ['Sci-Fi', 'Action'],
      isFavourited: null,
      overview: 'A hacker discovers the world is simulated.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      releaseDate: '1999-03-31',
      reviews: [
        {
          comment: 'Still incredible.',
          postedAt: '2026-01-01',
          reviewId: 5,
          starRating: 4.5,
          tmdbId: 603,
          updatedAt: '2026-01-02',
          username: 'neo_fan',
        },
      ],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: null,
    }

    getMovieDetailsMock.mockResolvedValueOnce(movie)

    renderWithProviders(
      <MemoryRouter initialEntries={['/movies/603']}>
        <Routes>
          <Route element={<MovieDetailPage />} path="/movies/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'The Matrix' })).toBeInTheDocument()
    })

    expect(screen.getAllByText('Sci-Fi').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Action').length).toBeGreaterThan(0)
    expect(screen.getByText('Still incredible.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in to track/i })).toBeInTheDocument()
  })

  it('shows logged-in actions and submits favourite and status updates', async () => {
    const user = userEvent.setup()

    useAuthStore.setState({
      accessToken: 'access-token',
      accessTokenExpiry: '2026-06-20T12:00:00',
      refreshToken: 'refresh-token',
      sessionExpired: false,
      tokenType: 'Bearer',
      username: 'viewer',
    })

    const movie: MovieDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      genres: ['Sci-Fi'],
      isFavourited: false,
      overview: 'A hacker discovers the world is simulated.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      releaseDate: '1999-03-31',
      reviews: [
        {
          comment: 'My own review',
          postedAt: '2026-01-01',
          reviewId: 22,
          starRating: 5,
          tmdbId: 603,
          updatedAt: '2026-01-02',
          username: 'viewer',
        },
      ],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: 'TO_WATCH',
    }

    getMovieDetailsMock.mockResolvedValue(movie)
    addFavouriteMock.mockResolvedValue(undefined)
    updateMovieStatusMock.mockResolvedValue({ status: 'WATCHED', tmdbId: 603 })

    renderWithProviders(
      <MemoryRouter initialEntries={['/movies/603']}>
        <Routes>
          <Route element={<MovieDetailPage />} path="/movies/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /track this title your way/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('link', { name: /sign in to track/i })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /update your take/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add to favourites/i }))
    await waitFor(() => {
      expect(addFavouriteMock).toHaveBeenCalledWith(603, 'MOVIE')
    })

    await user.selectOptions(screen.getByLabelText(/watch status/i), 'WATCHED')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(updateMovieStatusMock).toHaveBeenCalledWith(603, 'WATCHED')
    })
  })
})

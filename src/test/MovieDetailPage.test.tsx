import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { MovieDetailPage } from '../pages/MovieDetailPage'
import { renderWithProviders } from './renderWithProviders'
import type { MovieDetailsDTO, PageResponse, ReviewResponseDTO } from '../types/api'

const getMovieDetailsMock = vi.fn()
const getMovieReviewsMock = vi.fn()
const updateMovieStatusMock = vi.fn()
const addFavouriteMock = vi.fn()
const removeFavouriteMock = vi.fn()
const createReviewMock = vi.fn()
const updateReviewMock = vi.fn()
const deleteReviewMock = vi.fn()

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

vi.mock('../api/reviewApi', () => ({
  reviewApi: {
    createReview: (...args: unknown[]) => createReviewMock(...args),
    deleteReview: (...args: unknown[]) => deleteReviewMock(...args),
    getMovieReviews: (...args: unknown[]) => getMovieReviewsMock(...args),
    updateReview: (...args: unknown[]) => updateReviewMock(...args),
  },
}))

function createReviewPage(content: ReviewResponseDTO[]): PageResponse<ReviewResponseDTO> {
  return {
    content,
    empty: content.length === 0,
    first: true,
    last: true,
    number: 0,
    numberOfElements: content.length,
    size: 20,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
  }
}

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
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: null,
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }

    getMovieDetailsMock.mockResolvedValueOnce(movie)
    getMovieReviewsMock.mockResolvedValueOnce(
      createReviewPage([
        {
          comment: 'Still incredible.',
          postedAt: '2026-01-01',
          reviewId: 5,
          starRating: 4.5,
          tmdbId: 603,
          updatedAt: '2026-01-02',
          username: 'neo_fan',
        },
      ]),
    )

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
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: 'TO_WATCH',
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }

    getMovieDetailsMock.mockResolvedValue(movie)
    getMovieReviewsMock.mockResolvedValue(
      createReviewPage([
        {
          comment: 'My own review',
          postedAt: '2026-01-01',
          reviewId: 22,
          starRating: 5,
          tmdbId: 603,
          updatedAt: '2026-01-02',
          username: 'viewer',
        },
      ]),
    )
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
      expect(screen.getByRole('heading', { name: /track this title/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('link', { name: /sign in to track/i })).not.toBeInTheDocument()
    expect(screen.getAllByText('My own review').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /add to favourites/i }))
    await waitFor(() => {
      expect(addFavouriteMock).toHaveBeenCalledWith(603)
    })

    await user.click(screen.getByRole('button', { name: /mark as watched/i }))

    await waitFor(() => {
      expect(updateMovieStatusMock).toHaveBeenCalledWith(603, 'WATCHED')
    })
  })

  it('creates a review, closes the editor, and shows the review read-only', async () => {
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
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: 'TO_WATCH',
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }
    const createdReview: ReviewResponseDTO = {
      comment: 'This still absolutely works.',
      postedAt: '2026-01-01',
      reviewId: 44,
      starRating: 4,
      tmdbId: 603,
      updatedAt: '2026-01-01',
      username: 'viewer',
    }

    getMovieDetailsMock.mockResolvedValue(movie)
    getMovieReviewsMock.mockResolvedValue(createReviewPage([]))
    createReviewMock.mockResolvedValue(createdReview)

    renderWithProviders(
      <MemoryRouter initialEntries={['/movies/603']}>
        <Routes>
          <Route element={<MovieDetailPage />} path="/movies/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Write a review' })).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/comment/i), createdReview.comment)
    await user.click(screen.getByRole('button', { name: /post review/i }))

    await waitFor(() => {
      expect(createReviewMock.mock.calls[0]?.[0]).toEqual({
        comment: createdReview.comment,
        starRating: 4,
        tmdbId: 603,
        type: 'MOVIE',
      })
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /post review/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText(createdReview.comment)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit your review/i })).toBeInTheDocument()
  })

  it('shows an existing own review read-only and supports edit, cancel, update, and delete', async () => {
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
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: 'TO_WATCH',
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }
    const existingReview: ReviewResponseDTO = {
      comment: 'My own review',
      postedAt: '2026-01-01',
      reviewId: 22,
      starRating: 5,
      tmdbId: 603,
      updatedAt: '2026-01-02',
      username: 'viewer',
    }
    const updatedReview: ReviewResponseDTO = {
      ...existingReview,
      comment: 'Sharper on a rewatch.',
      starRating: 4,
      updatedAt: '2026-01-03',
    }

    getMovieDetailsMock.mockResolvedValue(movie)
    getMovieReviewsMock.mockResolvedValue(createReviewPage([existingReview]))
    updateReviewMock.mockResolvedValue(updatedReview)
    deleteReviewMock.mockResolvedValue(undefined)

    renderWithProviders(
      <MemoryRouter initialEntries={['/movies/603']}>
        <Routes>
          <Route element={<MovieDetailPage />} path="/movies/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByText(existingReview.comment).length).toBeGreaterThan(0)
    })

    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    const editButton = screen.getByRole('button', { name: /edit your review/i })
    expect(editButton).toBeInTheDocument()

    await user.click(editButton)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /edit your review/i }))
    const commentField = screen.getByLabelText(/comment/i)
    await user.clear(commentField)
    await user.type(commentField, updatedReview.comment)
    await user.selectOptions(screen.getByLabelText(/rating/i), '4')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateReviewMock).toHaveBeenCalledWith(22, {
        comment: updatedReview.comment,
        starRating: 4,
      })
    })
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    })
    expect(screen.getByText(updatedReview.comment)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /edit your review/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(deleteReviewMock.mock.calls[0]?.[0]).toBe(22)
    })
    expect(screen.getByRole('heading', { name: 'Write a review' })).toBeInTheDocument()
  })

  it('renders cast, trailer, and watch providers when data exists', async () => {
    const movie: MovieDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      genres: ['Sci-Fi'],
      isFavourited: null,
      overview: 'A hacker discovers the world is simulated.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      releaseDate: '1999-03-31',
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: null,
      cast: [
        {
          character: 'Neo',
          knownForDepartment: 'Acting',
          name: 'Keanu Reeves',
          order: 0,
          profilePath: '/keanu.jpg',
          tmdbPersonId: 1,
        },
        {
          character: 'Morpheus',
          knownForDepartment: 'Acting',
          name: 'Laurence Fishburne',
          order: 1,
          profilePath: null,
          tmdbPersonId: 2,
        },
      ],
      bestTrailer: {
        key: 'abc123',
        name: 'Official Trailer',
        official: true,
        publishedAt: '1999-01-01',
        site: 'YouTube',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
        type: 'Trailer',
        youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
      },
      watchProviders: {
        ads: [],
        buy: [],
        flatrate: [
          { displayPriority: 0, logoPath: '/netflix.png', providerId: 8, providerName: 'Netflix' },
        ],
        free: [],
        link: 'https://www.themoviedb.org/movie/603/watch',
        region: 'US',
        rent: [],
      },
    }

    getMovieDetailsMock.mockResolvedValueOnce(movie)
    getMovieReviewsMock.mockResolvedValueOnce(createReviewPage([]))

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

    expect(screen.getByRole('heading', { name: 'Cast' })).toBeInTheDocument()
    expect(screen.getByAltText('Keanu Reeves')).toBeInTheDocument()
    expect(screen.getByText('Keanu Reeves')).toBeInTheDocument()
    expect(screen.getByText('Neo')).toBeInTheDocument()
    expect(screen.getByText('Laurence Fishburne')).toBeInTheDocument()
    expect(screen.getByText('Morpheus')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /watch official trailer on youtube/i })).toBeInTheDocument()
    expect(screen.getAllByText('Official Trailer').length).toBeGreaterThan(0)

    expect(screen.getByRole('heading', { name: 'Where to watch' })).toBeInTheDocument()
    expect(screen.getByAltText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Stream')).toBeInTheDocument()
  })

  it('hides cast, trailer, and providers when extras are empty or null', async () => {
    const movie: MovieDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      genres: ['Sci-Fi'],
      isFavourited: null,
      overview: 'A hacker discovers the world is simulated.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      releaseDate: '1999-03-31',
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: null,
      cast: [],
      bestTrailer: null,
      watchProviders: { ads: [], buy: [], flatrate: [], free: [], link: null, region: 'US', rent: [] },
    }

    getMovieDetailsMock.mockResolvedValueOnce(movie)
    getMovieReviewsMock.mockResolvedValueOnce(createReviewPage([]))

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

    expect(screen.queryByRole('heading', { name: 'Cast' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Where to watch' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on youtube/i })).not.toBeInTheDocument()
  })
})

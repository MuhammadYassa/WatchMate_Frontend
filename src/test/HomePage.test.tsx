import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HomePage } from '../pages/HomePage'
import { useAuthStore } from '../auth/authStore'
import { renderWithProviders } from './renderWithProviders'
import type { ContinueWatchingResponseDTO, DiscoveryMediaItemDTO, HomeResponseDTO } from '../types/api'

const getContinueWatchingMock = vi.fn()
const getHomeMock = vi.fn()

const movie: DiscoveryMediaItemDTO = {
  tmdbId: 11, title: 'A movie', type: 'MOVIE', overview: 'A movie overview.',
  posterPath: '/movie.jpg', backdropPath: '/backdrop.jpg', rating: 8.1, releaseDate: '2026-03-01',
}
const show: DiscoveryMediaItemDTO = { ...movie, tmdbId: 22, title: 'A show', type: 'SHOW' }
function homeFixture(overrides: Partial<HomeResponseDTO> = {}): HomeResponseDTO {
  return {
    trendingMovies: [movie], trendingShows: [show], popularNow: [movie],
    airingToday: [show], upcoming: [movie], recommendedLater: [show],
    movieGenres: ['Action', 'Adventure', 'Drama', 'Science Fiction', 'Hidden fifth genre'],
    showGenres: ['Sci-Fi & Fantasy'], ...overrides,
  }
}
function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}
function renderHome() {
  return renderWithProviders(<MemoryRouter><HomePage /><LocationProbe /></MemoryRouter>)
}

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
    expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument()
    expect(screen.getByText('The Bear')).toBeInTheDocument()
    expect(screen.getByText('Severance')).toBeInTheDocument()
    expect(screen.getByText('Browse movie genres')).toBeInTheDocument()
  })

  it('keeps all six guest shelves, typed title links, discovery links and registration', async () => {
    useAuthStore.getState().clearAuth()
    getHomeMock.mockResolvedValue(homeFixture())
    renderHome()
    await screen.findByRole('heading', { name: 'A movie', level: 1 })
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Trending Movies', 'Trending Shows', 'Popular Now', 'Airing Today', 'Upcoming', 'Recommended Later',
    ])
    expect(getHomeMock).toHaveBeenCalledTimes(1)
    expect(getContinueWatchingMock).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/movies/11')
    expect(screen.getByRole('link', { name: /explore titles/i })).toHaveAttribute('href', '/discover')
    expect(screen.getAllByRole('link', { name: /explore more/i })).toHaveLength(2)
    expect(screen.getByRole('link', { name: /start tracking/i })).toHaveAttribute('href', '/register')
    expect(screen.getAllByRole('link', { name: /a show poster/i }).every(link => link.getAttribute('href') === '/shows/22')).toBe(true)
    expect(screen.queryByText('Continue watching')).not.toBeInTheDocument()
  })

  it('preserves the first four genre shortcuts and their encoded movie/show destinations', async () => {
    useAuthStore.getState().clearAuth()
    getHomeMock.mockResolvedValue(homeFixture())
    renderHome()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Science Fiction' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/discover?genreType=movie&genre=Science%20Fiction')
    await user.click(screen.getByRole('button', { name: 'Sci-Fi & Fantasy' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/discover?genreType=show&genre=Sci-Fi%20%26%20Fantasy')
    expect(screen.queryByRole('button', { name: 'Hidden fifth genre' })).not.toBeInTheDocument()
  })

  it('keeps the original hero fallback order and authenticated empty-resume behavior', async () => {
    getHomeMock.mockResolvedValue(homeFixture({ trendingMovies: [] }))
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    renderHome()
    await screen.findByRole('heading', { name: 'A show', level: 1 })
    expect(getContinueWatchingMock).toHaveBeenCalledWith(10)
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/shows/22')
    expect(screen.queryByText('Continue watching')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /start tracking/i })).not.toBeInTheDocument()
  })

  it('shows an honest loading state without interactive placeholder actions', () => {
    useAuthStore.getState().clearAuth()
    getHomeMock.mockReturnValue(new Promise(() => {}))
    renderHome()
    expect(screen.getByLabelText('Loading your Home feed')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('preserves retry after a home request failure', async () => {
    useAuthStore.getState().clearAuth()
    getHomeMock.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(homeFixture())
    renderHome()
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Try again' }))
    await screen.findByRole('heading', { name: 'A movie', level: 1 })
    expect(getHomeMock).toHaveBeenCalledTimes(2)
  })

  it('retains both empty feed messages and guest registration when every shelf is empty', async () => {
    useAuthStore.getState().clearAuth()
    getHomeMock.mockResolvedValue(homeFixture({ trendingMovies: [], trendingShows: [], popularNow: [], airingToday: [], upcoming: [], recommendedLater: [] }))
    renderHome()
    expect(await screen.findByRole('heading', { name: 'Nothing to show yet' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The browse canvas is quiet tonight' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start tracking/i })).toHaveAttribute('href', '/register')
  })

  it('retains poster fallback and keyboard-link semantics when artwork fails', async () => {
    useAuthStore.getState().clearAuth()
    getHomeMock.mockResolvedValue(homeFixture())
    renderHome()
    const poster = (await screen.findAllByRole('img', { name: 'A movie poster' }))[0]
    const link = poster.closest('a')!
    fireEvent.error(poster)
    expect(within(link).queryByRole('img')).not.toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/movies/11')
    link.focus()
    expect(link).toHaveFocus()
  })
})

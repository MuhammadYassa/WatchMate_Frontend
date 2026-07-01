import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { ShowDetailPage } from '../pages/ShowDetailPage'
import { renderWithProviders } from './renderWithProviders'
import type {
  NextEpisodeAiringDTO,
  PageResponse,
  ReviewResponseDTO,
  ShowDetailsDTO,
  ShowTrackingDTO,
} from '../types/api'

const getNextEpisodeMock = vi.fn()
const getShowReviewsMock = vi.fn()
const getShowDetailsMock = vi.fn()
const getShowProgressMock = vi.fn()
const getSeasonEpisodesMock = vi.fn()
const updateShowProgressMock = vi.fn()
const updateShowStatusMock = vi.fn()
const pollShowTrackingJobMock = vi.fn()

vi.mock('../api/showApi', () => ({
  showApi: {
    getNextEpisode: (...args: unknown[]) => getNextEpisodeMock(...args),
    getSeasonEpisodes: (...args: unknown[]) => getSeasonEpisodesMock(...args),
    getShowDetails: (...args: unknown[]) => getShowDetailsMock(...args),
    getShowProgress: (...args: unknown[]) => getShowProgressMock(...args),
    updateShowProgress: (...args: unknown[]) => updateShowProgressMock(...args),
    updateShowStatus: (...args: unknown[]) => updateShowStatusMock(...args),
  },
}))

vi.mock('../api/jobsApi', () => ({
  pollShowTrackingJob: (...args: unknown[]) => pollShowTrackingJobMock(...args),
}))

vi.mock('../api/reviewApi', () => ({
  reviewApi: {
    getShowReviews: (...args: unknown[]) => getShowReviewsMock(...args),
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

describe('ShowDetailPage', () => {
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

  it('renders seasons and the next episode area', async () => {
    const show: ShowDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      firstAirDate: '2022-02-18',
      genres: ['Drama', 'Mystery'],
      isFavourited: true,
      lastAirDate: '2025-01-10',
      lastEpisodeToAirEpisodeNumber: 10,
      lastEpisodeToAirName: 'Cold Harbor',
      lastEpisodeToAirSeasonNumber: 2,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: 19,
      numberOfSeasons: 2,
      overview: 'Workers split their memories between work and life.',
      posterPath: '/poster.jpg',
      rating: 8.6,
      reviews: [],
      seasons: [
        {
          airDate: '2022-02-18',
          episodeCount: 9,
          name: 'Season 1',
          overview: 'Season overview',
          posterPath: '/season-1.jpg',
          seasonNumber: 1,
          tmdbSeasonId: 1,
        },
        {
          airDate: '2026-02-18',
          episodeCount: 3,
          name: 'Specials',
          overview: 'Specials overview',
          posterPath: '/specials.jpg',
          seasonNumber: 0,
          tmdbSeasonId: 2,
        },
      ],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'WATCHING',
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }

    const nextEpisode: NextEpisodeAiringDTO = {
      episodeName: 'The After Hours',
      episodeNumber: 1,
      lastEpisodeToAirEpisodeNumber: 10,
      lastEpisodeToAirName: 'Cold Harbor',
      lastEpisodeToAirSeasonNumber: 2,
      nextEpisodeAirDate: '2026-10-10',
      seasonNumber: 3,
      tmdbId: 95396,
    }

    getShowDetailsMock.mockResolvedValueOnce(show)
    getShowReviewsMock.mockResolvedValueOnce(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValueOnce(nextEpisode)
    getShowProgressMock.mockResolvedValueOnce(null)
    getSeasonEpisodesMock.mockResolvedValueOnce({
      airDate: '2022-02-18',
      episodeCount: 9,
      episodes: [],
      name: 'Season 1',
      overview: 'Innies at work.',
      posterPath: '/season-1.jpg',
      seasonNumber: 1,
      tmdbId: 95396,
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Severance' })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /season 1/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /specials/i })).toBeInTheDocument()
    expect(screen.getByText('The After Hours')).toBeInTheDocument()
    expect(screen.getByText('Season 3 Episode 1')).toBeInTheDocument()
  })

  it('does not render the manual show progress form on show detail', async () => {
    const show: ShowDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: false,
      lastAirDate: '2025-01-10',
      lastEpisodeToAirEpisodeNumber: 10,
      lastEpisodeToAirName: 'Cold Harbor',
      lastEpisodeToAirSeasonNumber: 2,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: 19,
      numberOfSeasons: 2,
      overview: 'Workers split their memories between work and life.',
      posterPath: '/poster.jpg',
      rating: 8.6,
      reviews: [],
      seasons: [
        {
          airDate: '2022-02-18',
          episodeCount: 9,
          name: 'Season 1',
          overview: 'Season overview',
          posterPath: '/season-1.jpg',
          seasonNumber: 1,
          tmdbSeasonId: 1,
        },
      ],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'WATCHING',
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }

    const progress: ShowTrackingDTO = {
      completed: false,
      episodesWatchedCount: 2,
      latestWatchedEpisode: 2,
      latestWatchedSeason: 1,
      seasonsCompletedCount: 0,
      status: 'WATCHING',
      tmdbId: 95396,
      type: 'SHOW',
      watchPositionEpisode: 2,
      watchPositionSeason: 1,
      watchedEpisodes: [],
    }

    getShowDetailsMock.mockResolvedValue(show)
    getShowReviewsMock.mockResolvedValue(
      createReviewPage([
        {
          comment: 'Need this back immediately.',
          postedAt: '2026-01-01',
          reviewId: 3,
          starRating: 5,
          tmdbId: 95396,
          updatedAt: '2026-01-01',
          username: 'viewer',
        },
      ]),
    )
    getNextEpisodeMock.mockResolvedValue(null)
    getShowProgressMock.mockResolvedValue(progress)
    updateShowStatusMock.mockResolvedValue({
      data: progress,
      headers: new Headers(),
      status: 200,
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Current watch position' })).toBeInTheDocument()
    })

    expect(screen.getAllByText('Need this back immediately.').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: /set where you are now/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save progress/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^season$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/latest watched episode/i)).not.toBeInTheDocument()
    expect(updateShowProgressMock).not.toHaveBeenCalled()
  })

  it('renders cast, trailer, and watch providers when data exists', async () => {
    const show: ShowDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: false,
      lastAirDate: '2023-01-20',
      lastEpisodeToAirEpisodeNumber: 9,
      lastEpisodeToAirName: 'The We We Are',
      lastEpisodeToAirSeasonNumber: 1,
      nextEpisodeAirDate: '2025-01-17',
      nextEpisodeEpisodeNumber: 1,
      nextEpisodeName: 'Hello, Ms. Cobel',
      nextEpisodeSeasonNumber: 3,
      numberOfEpisodes: 9,
      numberOfSeasons: 2,
      overview: 'Workers split their memories between work and life.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      reviews: [],
      seasons: [
        {
          airDate: '2022-02-18',
          episodeCount: 9,
          name: 'Season 1',
          overview: 'Season overview',
          posterPath: '/season-1.jpg',
          seasonNumber: 1,
          tmdbSeasonId: 1,
        },
        {
          airDate: '2026-02-18',
          episodeCount: 3,
          name: 'Specials',
          overview: 'Specials overview',
          posterPath: '/specials.jpg',
          seasonNumber: 0,
          tmdbSeasonId: 2,
        },
      ],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'WATCHING',
      cast: [
        {
          character: 'Mark S.',
          knownForDepartment: 'Acting',
          name: 'Adam Scott',
          order: 0,
          profilePath: '/adam.jpg',
          tmdbPersonId: 10,
        },
        {
          character: null,
          knownForDepartment: 'Acting',
          name: 'Patricia Arquette',
          order: 1,
          profilePath: null,
          tmdbPersonId: 11,
        },
      ],
      bestTrailer: {
        key: 'xyz789',
        name: 'Season 2 Trailer',
        official: true,
        publishedAt: '2025-01-01',
        site: 'YouTube',
        thumbnailUrl: 'https://img.youtube.com/vi/xyz789/hqdefault.jpg',
        type: 'Trailer',
        youtubeUrl: 'https://www.youtube.com/watch?v=xyz789',
      },
      watchProviders: {
        ads: [],
        buy: [],
        flatrate: [
          { displayPriority: 0, logoPath: '/atv.png', providerId: 350, providerName: 'Apple TV+' },
        ],
        free: [],
        link: 'https://www.themoviedb.org/tv/95396/watch',
        region: 'US',
        rent: [],
      },
    }

    getShowDetailsMock.mockResolvedValueOnce(show)
    getShowReviewsMock.mockResolvedValueOnce(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValueOnce(null)
    getShowProgressMock.mockResolvedValueOnce(null)
    getSeasonEpisodesMock.mockResolvedValueOnce({
      airDate: '2022-02-18',
      episodeCount: 9,
      episodes: [],
      name: 'Season 1',
      overview: 'Innies at work.',
      posterPath: '/season-1.jpg',
      seasonNumber: 1,
      tmdbId: 95396,
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Severance' })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Cast' })).toBeInTheDocument()
    expect(screen.getByAltText('Adam Scott')).toBeInTheDocument()
    expect(screen.getByText('Adam Scott')).toBeInTheDocument()
    expect(screen.getByText('Mark S.')).toBeInTheDocument()
    expect(screen.getByText('Patricia Arquette')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /watch season 2 trailer on youtube/i })).toBeInTheDocument()
    expect(screen.getAllByText('Season 2 Trailer').length).toBeGreaterThan(0)

    expect(screen.getByRole('heading', { name: 'Where to watch' })).toBeInTheDocument()
    expect(screen.getByAltText('Apple TV+')).toBeInTheDocument()
    expect(screen.getByText('Stream')).toBeInTheDocument()
  })

  it('shows loading state on the main show button and keeps it while a 202 job is pending', async () => {
    const user = userEvent.setup()
    const show: ShowDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: false,
      lastAirDate: '2025-01-10',
      lastEpisodeToAirEpisodeNumber: 10,
      lastEpisodeToAirName: 'Cold Harbor',
      lastEpisodeToAirSeasonNumber: 2,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: 19,
      numberOfSeasons: 2,
      overview: 'Workers split their memories.',
      posterPath: '/poster.jpg',
      rating: 8.6,
      reviews: [],
      seasons: [],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: null,
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }

    let resolveJob: (value: unknown) => void
    const jobPromise = new Promise((resolve) => {
      resolveJob = resolve
    })

    getShowDetailsMock.mockResolvedValue(show)
    getShowReviewsMock.mockResolvedValue(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValue(null)
    getShowProgressMock.mockResolvedValue(null)
    updateShowStatusMock.mockResolvedValue({
      data: { jobId: 42, status: 'PENDING' },
      headers: new Headers({ 'Retry-After': '2', Location: '/api/v1/show-tracking-jobs/42' }),
      status: 202,
    })
    pollShowTrackingJobMock.mockReturnValue(jobPromise)

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Severance' })).toBeInTheDocument()
    })

    const markWatchedButton = screen.getByRole('button', { name: /mark all watched/i })
    await user.click(markWatchedButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /marking watched/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /marking watched/i })).toBeDisabled()

    resolveJob!({ errorCode: null, errorMessage: null, status: 'COMPLETED' })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /marking watched/i })).not.toBeInTheDocument()
    })
  })

  it('shows error toast and clears loading state when a 202 job fails', async () => {
    const user = userEvent.setup()
    const show: ShowDetailsDTO = {
      backdropPath: null,
      firstAirDate: '2022-02-18',
      genres: [],
      isFavourited: false,
      lastAirDate: null,
      lastEpisodeToAirEpisodeNumber: null,
      lastEpisodeToAirName: null,
      lastEpisodeToAirSeasonNumber: null,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: null,
      numberOfSeasons: null,
      overview: '',
      posterPath: null,
      rating: null,
      reviews: [],
      seasons: [],
      title: 'Unknown Show',
      tmdbId: 1111,
      tmdbShowStatus: null,
      type: 'SHOW',
      watchStatus: null,
      cast: [],
      bestTrailer: null,
      watchProviders: { region: 'US', link: null, flatrate: [], rent: [], buy: [], ads: [], free: [] },
    }

    getShowDetailsMock.mockResolvedValue(show)
    getShowReviewsMock.mockResolvedValue(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValue(null)
    getShowProgressMock.mockResolvedValue(null)
    updateShowStatusMock.mockResolvedValue({
      data: { jobId: 99, status: 'PENDING' },
      headers: new Headers({ 'Retry-After': '2', Location: '/api/v1/show-tracking-jobs/99' }),
      status: 202,
    })
    pollShowTrackingJobMock.mockResolvedValue({
      errorCode: 'SOME_ERROR',
      errorMessage: 'Backend failed to process.',
      status: 'FAILED',
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/1111']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Unknown Show' })).toBeInTheDocument()
    })

    const markWatchedButton = screen.getByRole('button', { name: /mark all watched/i })
    await user.click(markWatchedButton)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /marking watched/i })).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /mark all watched/i })).toBeInTheDocument()
  })

  it('hides cast, trailer, and providers when extras are empty or null', async () => {
    const show: ShowDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: false,
      lastAirDate: '2023-01-20',
      lastEpisodeToAirEpisodeNumber: 9,
      lastEpisodeToAirName: 'The We We Are',
      lastEpisodeToAirSeasonNumber: 1,
      nextEpisodeAirDate: '2025-01-17',
      nextEpisodeEpisodeNumber: 1,
      nextEpisodeName: 'Hello, Ms. Cobel',
      nextEpisodeSeasonNumber: 3,
      numberOfEpisodes: 9,
      numberOfSeasons: 2,
      overview: 'Workers split their memories between work and life.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      reviews: [],
      seasons: [
        {
          airDate: '2022-02-18',
          episodeCount: 9,
          name: 'Season 1',
          overview: 'Season overview',
          posterPath: '/season-1.jpg',
          seasonNumber: 1,
          tmdbSeasonId: 1,
        },
      ],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'WATCHING',
      cast: [],
      bestTrailer: null,
      watchProviders: { ads: [], buy: [], flatrate: [], free: [], link: null, region: 'US', rent: [] },
    }

    getShowDetailsMock.mockResolvedValueOnce(show)
    getShowReviewsMock.mockResolvedValueOnce(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValueOnce(null)
    getShowProgressMock.mockResolvedValueOnce(null)
    getSeasonEpisodesMock.mockResolvedValueOnce({
      airDate: '2022-02-18',
      episodeCount: 9,
      episodes: [],
      name: 'Season 1',
      overview: 'Innies at work.',
      posterPath: '/season-1.jpg',
      seasonNumber: 1,
      tmdbId: 95396,
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Severance' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: 'Cast' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Where to watch' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /on youtube/i })).not.toBeInTheDocument()
  })

  it('renders Plan to watch button for shows and sends TO_WATCH on click', async () => {
    const user = userEvent.setup()
    const show: ShowDetailsDTO = {
      backdropPath: null,
      bestTrailer: null,
      cast: [],
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: false,
      lastAirDate: null,
      lastEpisodeToAirEpisodeNumber: null,
      lastEpisodeToAirName: null,
      lastEpisodeToAirSeasonNumber: null,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: 9,
      numberOfSeasons: 1,
      overview: 'Office drama.',
      posterPath: null,
      rating: 8.5,
      reviews: [],
      seasons: [],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'WATCHING',
      watchProviders: { ads: [], buy: [], flatrate: [], free: [], link: null, region: 'US', rent: [] },
    }

    getShowDetailsMock.mockResolvedValue(show)
    getShowReviewsMock.mockResolvedValue(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValue(null)
    getShowProgressMock.mockResolvedValue(null)
    updateShowStatusMock.mockResolvedValue({
      data: { status: 'TO_WATCH', tmdbId: 95396 },
      headers: new Headers(),
      status: 200,
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /plan to watch/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /plan to watch/i }))

    await waitFor(() => {
      expect(updateShowStatusMock).toHaveBeenCalledWith(95396, 'TO_WATCH')
    })
  })

  it('renders Planned label with check when show watchStatus is TO_WATCH', async () => {
    const show: ShowDetailsDTO = {
      backdropPath: null,
      bestTrailer: null,
      cast: [],
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: false,
      lastAirDate: null,
      lastEpisodeToAirEpisodeNumber: null,
      lastEpisodeToAirName: null,
      lastEpisodeToAirSeasonNumber: null,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: 9,
      numberOfSeasons: 1,
      overview: 'Office drama.',
      posterPath: null,
      rating: 8.5,
      reviews: [],
      seasons: [],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'TO_WATCH',
      watchProviders: { ads: [], buy: [], flatrate: [], free: [], link: null, region: 'US', rent: [] },
    }

    getShowDetailsMock.mockResolvedValue(show)
    getShowReviewsMock.mockResolvedValue(createReviewPage([]))
    getNextEpisodeMock.mockResolvedValue(null)
    getShowProgressMock.mockResolvedValue(null)

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /planned/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /plan to watch/i })).not.toBeInTheDocument()
  })
})

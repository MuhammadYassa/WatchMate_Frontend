import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAuthStore } from '../auth/authStore'
import { SeasonEpisodesPage } from '../pages/SeasonEpisodesPage'
import { renderWithProviders } from './renderWithProviders'
import type { PageResponse, ShowEpisodeDetailsDTO, ShowDetailsDTO } from '../types/api'

const getSeasonEpisodesMock = vi.fn()
const getShowDetailsMock = vi.fn()
const updateShowProgressMock = vi.fn()
const pollShowTrackingJobMock = vi.fn()

vi.mock('../api/showApi', () => ({
  showApi: {
    getSeasonEpisodes: (...args: unknown[]) => getSeasonEpisodesMock(...args),
    getShowDetails: (...args: unknown[]) => getShowDetailsMock(...args),
    updateShowProgress: (...args: unknown[]) => updateShowProgressMock(...args),
  },
}))

vi.mock('../api/jobsApi', () => ({
  pollShowTrackingJob: (...args: unknown[]) => pollShowTrackingJobMock(...args),
}))

function makeEpisodesPage(episodes: ShowEpisodeDetailsDTO[]): PageResponse<ShowEpisodeDetailsDTO> {
  return {
    content: episodes,
    empty: episodes.length === 0,
    first: true,
    last: true,
    number: 0,
    numberOfElements: episodes.length,
    size: 20,
    totalElements: episodes.length,
    totalPages: episodes.length > 0 ? 1 : 0,
  }
}

function makeShowDetails(tmdbId: number, seasonNumber: number, overrides?: Partial<ShowDetailsDTO>): ShowDetailsDTO {
  return {
    backdropPath: null,
    bestTrailer: null,
    cast: [],
    firstAirDate: '2024-01-01',
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
    numberOfEpisodes: null,
    numberOfSeasons: null,
    overview: 'A great show.',
    posterPath: null,
    rating: 8.5,
    reviews: [],
    seasons: [
      {
        airDate: '2024-01-01',
        episodeCount: 3,
        name: 'Season 1',
        overview: 'The story begins.',
        posterPath: '/season-1.jpg',
        seasonNumber,
        tmdbSeasonId: 9000,
      },
    ],
    title: 'Test Show',
    tmdbId,
    tmdbShowStatus: 'Returning Series',
    type: 'SHOW',
    watchProviders: { ads: [], buy: [], flatrate: [], free: [], link: null, region: 'US', rent: [] },
    watchStatus: 'WATCHING',
    ...overrides,
  }
}

describe('SeasonEpisodesPage', () => {
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

  it('renders clear watched, unwatched, and unaired states without exposing tmdbEpisodeId', async () => {
    const user = userEvent.setup()
    const episodes: ShowEpisodeDetailsDTO[] = [
      {
        airDate: '2024-01-01',
        episodeNumber: 1,
        isAired: true,
        name: 'Pilot',
        overview: 'The first episode arrives.',
        runtime: 58,
        seasonNumber: 1,
        stillPath: '/pilot.jpg',
        tmdbEpisodeId: 9999,
        watched: true,
      },
      {
        airDate: '2024-01-08',
        episodeNumber: 2,
        isAired: true,
        name: 'Second',
        overview: 'The second episode arrives.',
        runtime: 56,
        seasonNumber: 1,
        stillPath: '/second.jpg',
        tmdbEpisodeId: 10000,
        watched: false,
      },
      {
        airDate: '2026-12-01',
        episodeNumber: 3,
        isAired: false,
        name: 'Soon',
        overview: 'Not out yet.',
        runtime: 61,
        seasonNumber: 1,
        stillPath: null,
        tmdbEpisodeId: 10001,
        watched: false,
      },
    ]

    getShowDetailsMock.mockResolvedValueOnce(makeShowDetails(95396, 1))
    getSeasonEpisodesMock.mockResolvedValueOnce(makeEpisodesPage(episodes))
    updateShowProgressMock.mockResolvedValue({
      data: {
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
      },
      headers: new Headers(),
      status: 200,
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396/seasons/1/episodes']}>
        <Routes>
          <Route
            element={<SeasonEpisodesPage />}
            path="/shows/:tmdbId/seasons/:seasonNumber/episodes"
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Season 1' })).toBeInTheDocument()
    })

    expect(screen.getAllByText('Watched').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Unaired').length).toBeGreaterThan(0)
    const watchedButton = screen.getByRole('button', { name: /watched: season 1 episode 1/i })
    const unwatchedButton = screen.getByRole('button', {
      name: /mark watched through this episode: season 1 episode 2/i,
    })

    expect(watchedButton).toHaveAttribute('aria-pressed', 'true')
    expect(unwatchedButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: /episode 3/i })).not.toBeInTheDocument()

    await user.click(unwatchedButton)

    await waitFor(() => {
      expect(updateShowProgressMock).toHaveBeenCalledWith(95396, {
        watchPositionEpisode: 2,
        watchPositionSeason: 1,
      })
    })

    expect(screen.queryByText('9999')).not.toBeInTheDocument()
    expect(screen.queryByText('10000')).not.toBeInTheDocument()
    expect(screen.queryByText('10001')).not.toBeInTheDocument()
  })

  it('shows syncing feedback and disables tick buttons while a 202 job is in progress', async () => {
    const user = userEvent.setup()
    const episodes: ShowEpisodeDetailsDTO[] = [
      {
        airDate: '2024-01-01',
        episodeNumber: 1,
        isAired: true,
        name: 'Pilot',
        overview: 'First.',
        runtime: 58,
        seasonNumber: 1,
        stillPath: null,
        tmdbEpisodeId: 9999,
        watched: false,
      },
      {
        airDate: '2024-01-08',
        episodeNumber: 2,
        isAired: true,
        name: 'Second',
        overview: 'Second.',
        runtime: 56,
        seasonNumber: 1,
        stillPath: null,
        tmdbEpisodeId: 10000,
        watched: false,
      },
    ]

    getShowDetailsMock.mockResolvedValue(makeShowDetails(95396, 1))
    getSeasonEpisodesMock.mockResolvedValue(makeEpisodesPage(episodes))

    let resolveJob: (value: unknown) => void
    const jobPromise = new Promise((resolve) => {
      resolveJob = resolve
    })

    updateShowProgressMock.mockResolvedValue({
      data: { jobId: 1, status: 'PENDING' },
      headers: new Headers({ 'Retry-After': '2', Location: '/api/v1/show-tracking-jobs/1' }),
      status: 202,
    })
    pollShowTrackingJobMock.mockReturnValue(jobPromise)

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396/seasons/1/episodes']}>
        <Routes>
          <Route
            element={<SeasonEpisodesPage />}
            path="/shows/:tmdbId/seasons/:seasonNumber/episodes"
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Season 1' })).toBeInTheDocument()
    })

    const ep1Button = screen.getByRole('button', {
      name: /mark watched through this episode: season 1 episode 1/i,
    })
    await user.click(ep1Button)

    await waitFor(() => {
      expect(screen.getByText('Syncing progress…')).toBeInTheDocument()
    })

    const allTickButtons = screen.getAllByRole('button', {
      name: /mark watched through this episode|watched:/i,
    })
    for (const btn of allTickButtons) {
      expect(btn).toBeDisabled()
    }

    resolveJob!({ errorCode: null, errorMessage: null, status: 'COMPLETED' })

    await waitFor(() => {
      expect(screen.queryByText('Syncing progress…')).not.toBeInTheDocument()
    })
  })

  it('renders pagination controls and navigates between pages', async () => {
    const user = userEvent.setup()

    const page0Episode: ShowEpisodeDetailsDTO = {
      airDate: '2024-01-01',
      episodeNumber: 1,
      isAired: true,
      name: 'Pilot',
      overview: 'First.',
      runtime: 45,
      seasonNumber: 1,
      stillPath: null,
      tmdbEpisodeId: 1001,
      watched: false,
    }
    const page1Episode: ShowEpisodeDetailsDTO = {
      airDate: '2024-01-08',
      episodeNumber: 21,
      isAired: true,
      name: 'The Descent',
      overview: 'Twenty-first.',
      runtime: 45,
      seasonNumber: 1,
      stillPath: null,
      tmdbEpisodeId: 1021,
      watched: false,
    }

    const page0: PageResponse<ShowEpisodeDetailsDTO> = {
      content: [page0Episode],
      empty: false,
      first: true,
      last: false,
      number: 0,
      numberOfElements: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2,
    }
    const page1: PageResponse<ShowEpisodeDetailsDTO> = {
      content: [page1Episode],
      empty: false,
      first: false,
      last: true,
      number: 1,
      numberOfElements: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2,
    }

    getShowDetailsMock.mockResolvedValue(makeShowDetails(95396, 1))
    getSeasonEpisodesMock.mockResolvedValueOnce(page0).mockResolvedValueOnce(page1)

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396/seasons/1/episodes']}>
        <Routes>
          <Route
            element={<SeasonEpisodesPage />}
            path="/shows/:tmdbId/seasons/:seasonNumber/episodes"
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Pilot')).toBeInTheDocument()
    })

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByText('The Descent')).toBeInTheDocument()
    })

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled()
  })
})

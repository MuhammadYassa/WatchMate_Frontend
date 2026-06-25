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
    expect(screen.getByText('Next episode')).toBeInTheDocument()
  })

  it('submits show progress and polls async jobs when the backend responds with 202', async () => {
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
    getSeasonEpisodesMock.mockResolvedValue({
      airDate: '2022-02-18',
      episodeCount: 3,
      episodes: [
        {
          airDate: '2022-02-18',
          episodeNumber: 1,
          isAired: true,
          name: 'Good News About Hell',
          overview: 'Orientation begins.',
          runtime: 57,
          seasonNumber: 1,
          stillPath: '/ep-1.jpg',
          tmdbEpisodeId: 1,
          watched: true,
        },
        {
          airDate: '2022-02-25',
          episodeNumber: 2,
          isAired: true,
          name: 'Half Loop',
          overview: 'The work continues.',
          runtime: 55,
          seasonNumber: 1,
          stillPath: '/ep-2.jpg',
          tmdbEpisodeId: 2,
          watched: true,
        },
        {
          airDate: '2022-03-04',
          episodeNumber: 3,
          isAired: true,
          name: 'In Perpetuity',
          overview: 'Mark takes a tour.',
          runtime: 56,
          seasonNumber: 1,
          stillPath: '/ep-3.jpg',
          tmdbEpisodeId: 3,
          watched: false,
        },
      ],
      name: 'Season 1',
      overview: 'Innies at work.',
      posterPath: '/season-1.jpg',
      seasonNumber: 1,
      tmdbId: 95396,
    })
    updateShowProgressMock.mockResolvedValue({
      data: {
        completedAt: null,
        completedSeasons: 0,
        createdAt: '2026-06-20T10:00:00',
        errorCode: null,
        errorMessage: null,
        finalStatus: null,
        jobId: 42,
        jobType: 'SET_SHOW_PROGRESS',
        mediaId: 10,
        message: 'Queued',
        requestedStatus: null,
        startedAt: '2026-06-20T10:00:01',
        status: 'PENDING',
        targetEpisodeNumber: 2,
        targetSeasonNumber: 1,
        tmdbId: 95396,
        totalSeasons: 2,
        updatedAt: '2026-06-20T10:00:01',
      },
      headers: new Headers(),
      status: 202,
    })
    updateShowStatusMock.mockResolvedValue({
      data: progress,
      headers: new Headers(),
      status: 200,
    })
    pollShowTrackingJobMock.mockResolvedValue({
      completedAt: '2026-06-20T10:00:10',
      completedSeasons: 0,
      createdAt: '2026-06-20T10:00:00',
      errorCode: null,
      errorMessage: null,
      finalStatus: null,
      jobId: 42,
      jobType: 'SET_SHOW_PROGRESS',
      mediaId: 10,
      message: 'Complete',
      requestedStatus: null,
      startedAt: '2026-06-20T10:00:01',
      status: 'COMPLETED',
      targetEpisodeNumber: 2,
      targetSeasonNumber: 1,
      tmdbId: 95396,
      totalSeasons: 2,
      updatedAt: '2026-06-20T10:00:10',
    })

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396']}>
        <Routes>
          <Route element={<ShowDetailPage />} path="/shows/:tmdbId" />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /set where you are now/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /update your take/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /save progress/i }))

    await waitFor(() => {
      expect(updateShowProgressMock).toHaveBeenCalledWith(95396, {
        watchPositionEpisode: 2,
        watchPositionSeason: 1,
      })
    })

    await waitFor(() => {
      expect(pollShowTrackingJobMock).toHaveBeenCalled()
    })
  })
})

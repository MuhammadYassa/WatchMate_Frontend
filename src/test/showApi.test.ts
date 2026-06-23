import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../api/client'
import { showApi } from '../api/showApi'
import { ApiClientError } from '../types/errors'
import type { NextEpisodeAiringDTO, ShowDetailsDTO, ShowSeasonsDetailsDTO } from '../types/api'

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('showApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets show details', async () => {
    const show: ShowDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      firstAirDate: '2022-02-18',
      genres: ['Drama'],
      isFavourited: true,
      lastAirDate: '2025-01-01',
      lastEpisodeToAirEpisodeNumber: 8,
      lastEpisodeToAirName: 'The We We Are',
      lastEpisodeToAirSeasonNumber: 1,
      nextEpisodeAirDate: null,
      nextEpisodeEpisodeNumber: null,
      nextEpisodeName: null,
      nextEpisodeSeasonNumber: null,
      numberOfEpisodes: 9,
      numberOfSeasons: 1,
      overview: 'Office workers split their memories.',
      posterPath: '/poster.jpg',
      rating: 8.5,
      reviews: [],
      seasons: [],
      title: 'Severance',
      tmdbId: 95396,
      tmdbShowStatus: 'Returning Series',
      type: 'SHOW',
      watchStatus: 'WATCHING',
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: show,
      headers: new Headers(),
      status: 200,
    })

    await expect(showApi.getShowDetails(95396)).resolves.toEqual(show)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/shows/95396')
  })

  it('gets next episode details', async () => {
    const nextEpisode: NextEpisodeAiringDTO = {
      episodeName: 'Hello, Ms. Cobel',
      episodeNumber: 1,
      lastEpisodeToAirEpisodeNumber: 8,
      lastEpisodeToAirName: 'The We We Are',
      lastEpisodeToAirSeasonNumber: 1,
      nextEpisodeAirDate: '2026-01-10',
      seasonNumber: 2,
      tmdbId: 95396,
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: nextEpisode,
      headers: new Headers(),
      status: 200,
    })

    await expect(showApi.getNextEpisode(95396)).resolves.toEqual(nextEpisode)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/shows/95396/next-episode')
  })

  it('gets season episodes', async () => {
    const season: ShowSeasonsDetailsDTO = {
      airDate: '2022-02-18',
      episodeCount: 2,
      episodes: [],
      name: 'Season 1',
      overview: 'The first run.',
      posterPath: '/season.jpg',
      seasonNumber: 1,
      tmdbId: 95396,
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: season,
      headers: new Headers(),
      status: 200,
    })

    await expect(showApi.getSeasonEpisodes(95396, 1)).resolves.toEqual(season)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/shows/95396/seasons/1/episodes')
  })

  it('returns null when no show progress row exists yet', async () => {
    mockedApiClient.get.mockRejectedValueOnce(
      new ApiClientError({
        code: 'NOT_FOUND',
        fields: [],
        message: 'Not found',
        status: 404,
      }),
    )

    await expect(showApi.getShowProgress(95396)).resolves.toBeNull()
    expect(mockedApiClient.get).toHaveBeenCalledWith('/shows/95396/progress')
  })

  it('updates show status through the canonical endpoint', async () => {
    const response = {
      data: {
        completed: false,
        episodesWatchedCount: 0,
        latestWatchedEpisode: null,
        latestWatchedSeason: null,
        seasonsCompletedCount: 0,
        status: 'WATCHING' as const,
        tmdbId: 95396,
        type: 'SHOW' as const,
        watchPositionEpisode: null,
        watchPositionSeason: null,
        watchedEpisodes: [],
      },
      headers: new Headers(),
      status: 200,
    }

    mockedApiClient.put = vi.fn().mockResolvedValueOnce(response)

    await expect(showApi.updateShowStatus(95396, 'WATCHING')).resolves.toEqual(response)
    expect(mockedApiClient.put).toHaveBeenCalledWith('/shows/95396/status', {
      body: { status: 'WATCHING' },
    })
  })

  it('updates show progress through the canonical endpoint', async () => {
    const response = {
      data: {
        completed: false,
        episodesWatchedCount: 3,
        latestWatchedEpisode: 3,
        latestWatchedSeason: 1,
        seasonsCompletedCount: 0,
        status: 'WATCHING' as const,
        tmdbId: 95396,
        type: 'SHOW' as const,
        watchPositionEpisode: 3,
        watchPositionSeason: 1,
        watchedEpisodes: [],
      },
      headers: new Headers(),
      status: 200,
    }

    mockedApiClient.put = vi.fn().mockResolvedValueOnce(response)

    await expect(
      showApi.updateShowProgress(95396, {
        watchPositionEpisode: 3,
        watchPositionSeason: 1,
      }),
    ).resolves.toEqual(response)
    expect(mockedApiClient.put).toHaveBeenCalledWith('/shows/95396/progress', {
      body: { watchPositionEpisode: 3, watchPositionSeason: 1 },
    })
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../api/client'
import { movieApi } from '../api/movieApi'
import type { MovieDetailsDTO } from '../types/api'

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('movieApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets movie details', async () => {
    const movie: MovieDetailsDTO = {
      backdropPath: '/backdrop.jpg',
      genres: ['Sci-Fi'],
      isFavourited: false,
      overview: 'A mind-bending thriller.',
      posterPath: '/poster.jpg',
      rating: 8.7,
      releaseDate: '1999-03-31',
      reviews: [],
      title: 'The Matrix',
      tmdbId: 603,
      type: 'MOVIE',
      watchStatus: 'WATCHED',
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: movie,
      headers: new Headers(),
      status: 200,
    })

    await expect(movieApi.getMovieDetails(603)).resolves.toEqual(movie)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/movies/603')
  })

  it('updates movie watch status', async () => {
    const response = {
      data: {
        status: 'WATCHING' as const,
        tmdbId: 603,
      },
      headers: new Headers(),
      status: 200,
    }

    mockedApiClient.put.mockResolvedValueOnce(response)

    await expect(movieApi.updateMovieStatus(603, 'WATCHING')).resolves.toEqual(response.data)
    expect(mockedApiClient.put).toHaveBeenCalledWith('/movies/603/status', {
      body: { status: 'WATCHING' },
    })
  })
})

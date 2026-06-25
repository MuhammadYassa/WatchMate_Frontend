import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../api/client'
import { favouriteApi } from '../api/favouriteApi'
import { reviewApi } from '../api/reviewApi'
import { watchlistApi } from '../api/watchlistApi'
import type { PageResponse, ReviewResponseDTO, WatchListDTO } from '../types/api'

vi.mock('../api/client', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('media interaction APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the new favourite add and remove endpoints', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: undefined,
      headers: new Headers(),
      status: 200,
    })
    mockedApiClient.delete.mockResolvedValueOnce({
      data: undefined,
      headers: new Headers(),
      status: 200,
    })

    await favouriteApi.addFavourite(603)
    await favouriteApi.removeFavourite(603)

    expect(mockedApiClient.post).toHaveBeenCalledWith('/favourites/603')
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/favourites/603')
  })

  it('gets the paginated favourites collection', async () => {
    const favourites: PageResponse<never> = {
      content: [],
      empty: true,
      first: true,
      last: true,
      number: 0,
      numberOfElements: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: favourites,
      headers: new Headers(),
      status: 200,
    })

    await expect(favouriteApi.getFavourites(0, 20)).resolves.toEqual(favourites)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/favourites?page=0&size=20')
  })

  it('gets favourite status from the new status endpoint', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { isFavourited: true, tmdbId: 603 },
      headers: new Headers(),
      status: 200,
    })

    await expect(favouriteApi.getFavouriteStatus(603)).resolves.toEqual({
      isFavourited: true,
      tmdbId: 603,
    })

    expect(mockedApiClient.get).toHaveBeenCalledWith('/favourites/603/status')
  })

  it('creates reviews with the new reviews endpoint', async () => {
    const review: ReviewResponseDTO = {
      comment: 'Excellent.',
      postedAt: '2026-06-20T10:00:00',
      reviewId: 1,
      starRating: 5,
      tmdbId: 603,
      updatedAt: '2026-06-20T10:00:00',
      username: 'viewer',
    }

    mockedApiClient.post.mockResolvedValueOnce({
      data: review,
      headers: new Headers(),
      status: 200,
    })

    await expect(
      reviewApi.createReview({
        comment: 'Excellent.',
        starRating: 5,
        tmdbId: 603,
        type: 'MOVIE',
      }),
    ).resolves.toEqual(review)

    expect(mockedApiClient.post).toHaveBeenCalledWith('/reviews', {
      body: {
        comment: 'Excellent.',
        starRating: 5,
        tmdbId: 603,
        type: 'MOVIE',
      },
    })
  })

  it('gets paginated movie and show reviews', async () => {
    const movieReviews: PageResponse<ReviewResponseDTO> = {
      content: [],
      empty: true,
      first: true,
      last: true,
      number: 0,
      numberOfElements: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    }
    const showReviews: PageResponse<ReviewResponseDTO> = {
      ...movieReviews,
    }

    mockedApiClient.get
      .mockResolvedValueOnce({
        data: movieReviews,
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: showReviews,
        headers: new Headers(),
        status: 200,
      })

    await expect(reviewApi.getMovieReviews(603, 0, 20)).resolves.toEqual(movieReviews)
    await expect(reviewApi.getShowReviews(95396, 1, 10)).resolves.toEqual(showReviews)

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, '/movies/603/reviews?page=0&size=20')
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, '/shows/95396/reviews?page=1&size=10')
  })

  it('passes media type when adding items to watchlists and returns the paged list', async () => {
    const watchlists: PageResponse<WatchListDTO> = {
      content: [
        {
          id: 1,
          media: [],
          name: 'Weekend picks',
        },
      ],
      empty: false,
      first: true,
      last: true,
      number: 0,
      numberOfElements: 1,
      size: 50,
      totalElements: 1,
      totalPages: 1,
    }

    mockedApiClient.post.mockResolvedValueOnce({
      data: undefined,
      headers: new Headers(),
      status: 200,
    })
    mockedApiClient.get.mockResolvedValueOnce({
      data: watchlists,
      headers: new Headers(),
      status: 200,
    })

    await watchlistApi.addItem(8, 603, 'MOVIE')
    await expect(watchlistApi.getWatchlists(0, 50)).resolves.toEqual(watchlists)

    expect(mockedApiClient.post).toHaveBeenCalledWith('/watchlists/8/items/603?type=MOVIE')
    expect(mockedApiClient.get).toHaveBeenCalledWith('/watchlists?page=0&size=50')
  })

  it('creates, renames, removes items from, and deletes watchlists with typed responses', async () => {
    const watchlist: WatchListDTO = {
      id: 8,
      media: [],
      name: 'Weekend picks',
    }
    const renamedWatchlist: WatchListDTO = {
      ...watchlist,
      name: 'Friday night',
    }
    const updatedWatchlist: WatchListDTO = {
      ...watchlist,
      media: [
        {
          backdropPath: null,
          genres: [],
          isFavourited: false,
          overview: '',
          posterPath: null,
          rating: 8.2,
          releaseDate: '2026-06-01',
          reviews: [],
          title: 'Arrival',
          tmdbId: 199,
          type: 'MOVIE',
          watchStatus: 'WATCHED',
        },
      ],
    }

    mockedApiClient.post.mockResolvedValueOnce({
      data: watchlist,
      headers: new Headers(),
      status: 200,
    })
    mockedApiClient.patch.mockResolvedValueOnce({
      data: renamedWatchlist,
      headers: new Headers(),
      status: 200,
    })
    mockedApiClient.delete
      .mockResolvedValueOnce({
        data: updatedWatchlist,
        headers: new Headers(),
        status: 200,
      })
      .mockResolvedValueOnce({
        data: undefined,
        headers: new Headers(),
        status: 204,
      })

    await expect(watchlistApi.createWatchlist({ name: 'Weekend picks' })).resolves.toEqual(watchlist)
    await expect(watchlistApi.renameWatchlist(8, { newName: 'Friday night' })).resolves.toEqual(
      renamedWatchlist,
    )
    await expect(watchlistApi.removeItem(8, 199, 'MOVIE')).resolves.toEqual(updatedWatchlist)
    await expect(watchlistApi.deleteWatchlist(8)).resolves.toBeUndefined()

    expect(mockedApiClient.post).toHaveBeenCalledWith('/watchlists', {
      body: { name: 'Weekend picks' },
    })
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/watchlists/8', {
      body: { newName: 'Friday night' },
    })
    expect(mockedApiClient.delete).toHaveBeenNthCalledWith(1, '/watchlists/8/items/199?type=MOVIE')
    expect(mockedApiClient.delete).toHaveBeenNthCalledWith(2, '/watchlists/8')
  })
})

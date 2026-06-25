import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FavouritesPage } from '../pages/FavouritesPage'
import { renderWithProviders } from './renderWithProviders'
import type { MediaDetailsDTO, PageResponse } from '../types/api'

const getFavouritesMock = vi.fn()
const removeFavouriteMock = vi.fn()

vi.mock('../api/favouriteApi', () => ({
  favouriteApi: {
    getFavourites: (...args: unknown[]) => getFavouritesMock(...args),
    removeFavourite: (...args: unknown[]) => removeFavouriteMock(...args),
  },
}))

function createFavourite(overrides: Partial<MediaDetailsDTO> = {}): MediaDetailsDTO {
  return {
    backdropPath: null,
    genres: [],
    isFavourited: true,
    overview: '',
    posterPath: '/poster.jpg',
    rating: 8.2,
    releaseDate: '2026-06-01',
    reviews: [],
    title: 'Arrival',
    tmdbId: 199,
    type: 'MOVIE',
    watchStatus: 'WATCHED',
    ...overrides,
  }
}

function createPage(content: MediaDetailsDTO[], number = 0, totalPages = 1): PageResponse<MediaDetailsDTO> {
  return {
    content,
    empty: content.length === 0,
    first: number === 0,
    last: number >= totalPages - 1,
    number,
    numberOfElements: content.length,
    size: 20,
    totalElements: totalPages === 1 ? content.length : totalPages,
    totalPages,
  }
}

describe('FavouritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders favourites and removes a title', async () => {
    const user = userEvent.setup()
    let currentState = createPage([createFavourite()])

    getFavouritesMock.mockImplementation(() => Promise.resolve(currentState))
    removeFavouriteMock.mockImplementation(() => {
      currentState = createPage([])
      return Promise.resolve({ isFavourited: false, tmdbId: 199 })
    })

    renderWithProviders(
      <MemoryRouter>
        <FavouritesPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Arrival')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /remove favourite/i }))

    await waitFor(() => {
      expect(screen.getByText('No favourites yet')).toBeInTheDocument()
    })
  })

  it('shows the empty state when there are no favourites', async () => {
    getFavouritesMock.mockResolvedValue(createPage([]))

    renderWithProviders(
      <MemoryRouter>
        <FavouritesPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No favourites yet')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /explore picks/i })).toBeInTheDocument()
  })

  it('supports previous and next pagination', async () => {
    const user = userEvent.setup()

    getFavouritesMock.mockImplementation((page: number) => {
      if (page === 0) {
        return Promise.resolve(createPage([createFavourite({ title: 'Arrival' })], 0, 2))
      }

      return Promise.resolve(createPage([createFavourite({ title: 'Severance', tmdbId: 95396, type: 'SHOW' })], 1, 2))
    })

    renderWithProviders(
      <MemoryRouter>
        <FavouritesPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Arrival')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => {
      expect(screen.getByText('Severance')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /previous/i }))

    await waitFor(() => {
      expect(screen.getByText('Arrival')).toBeInTheDocument()
    })
  })
})

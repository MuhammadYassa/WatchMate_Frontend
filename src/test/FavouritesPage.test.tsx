import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FavouritesPage } from '../pages/FavouritesPage'
import { renderWithProviders } from './renderWithProviders'
import type { UserFavouritesDTO } from '../types/api'

const getAllMock = vi.fn()
const removeFavouriteMock = vi.fn()

vi.mock('../api/favouriteApi', () => ({
  favouriteApi: {
    getAll: (...args: unknown[]) => getAllMock(...args),
    removeFavourite: (...args: unknown[]) => removeFavouriteMock(...args),
  },
}))

describe('FavouritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders favourites and removes a title', async () => {
    const user = userEvent.setup()
    let currentState: UserFavouritesDTO = {
      favourites: [
        {
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
        },
      ],
      totalCount: 1,
    }

    getAllMock.mockImplementation(() => Promise.resolve(currentState))
    removeFavouriteMock.mockImplementation(() => {
      currentState = {
        favourites: [],
        totalCount: 0,
      }
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
    getAllMock.mockResolvedValue({
      favourites: [],
      totalCount: 0,
    })

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
})

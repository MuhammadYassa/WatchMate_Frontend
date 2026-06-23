import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WatchlistsPage } from '../pages/WatchlistsPage'
import { renderWithProviders } from './renderWithProviders'
import type { SpringPage, WatchListDTO } from '../types/api'

const createWatchlistMock = vi.fn()
const deleteWatchlistMock = vi.fn()
const getWatchlistsMock = vi.fn()
const removeItemMock = vi.fn()
const renameWatchlistMock = vi.fn()

vi.mock('../api/watchlistApi', () => ({
  watchlistApi: {
    createWatchlist: (...args: unknown[]) => createWatchlistMock(...args),
    deleteWatchlist: (...args: unknown[]) => deleteWatchlistMock(...args),
    getWatchlists: (...args: unknown[]) => getWatchlistsMock(...args),
    removeItem: (...args: unknown[]) => removeItemMock(...args),
    renameWatchlist: (...args: unknown[]) => renameWatchlistMock(...args),
  },
}))

function createPage(content: WatchListDTO[]): SpringPage<WatchListDTO> {
  return {
    content,
    empty: content.length === 0,
    first: true,
    last: true,
    number: 0,
    numberOfElements: content.length,
    size: 20,
    totalElements: content.length,
    totalPages: 1,
  }
}

describe('WatchlistsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders watchlists and expands inline items', async () => {
    const watchlists = createPage([
      {
        id: 7,
        media: [
          {
            backdropPath: null,
            genres: [],
            isFavourited: false,
            overview: '',
            posterPath: '/poster.jpg',
            rating: 8.1,
            releaseDate: '2026-06-01',
            reviews: [],
            title: 'Arrival',
            tmdbId: 199,
            type: 'MOVIE',
            watchStatus: 'WATCHED',
          },
        ],
        name: 'Weekend picks',
      },
    ])

    getWatchlistsMock.mockResolvedValue(watchlists)

    renderWithProviders(
      <MemoryRouter>
        <WatchlistsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Weekend picks' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /open list/i }))

    expect(screen.getByText('Arrival')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove from list/i })).toBeInTheDocument()
  })

  it('creates a watchlist and updates the visible list', async () => {
    const user = userEvent.setup()
    let currentPage = createPage([])
    const createdWatchlist: WatchListDTO = {
      id: 12,
      media: [],
      name: 'Friday night',
    }

    getWatchlistsMock.mockImplementation(() => Promise.resolve(currentPage))
    createWatchlistMock.mockImplementation(() => {
      currentPage = createPage([createdWatchlist])
      return Promise.resolve(createdWatchlist)
    })

    renderWithProviders(
      <MemoryRouter>
        <WatchlistsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No watchlists yet')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /new watchlist/i }))
    fireEvent.change(screen.getByPlaceholderText('Weekend picks'), {
      target: { value: 'Friday night' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create watchlist/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Friday night' })).toBeInTheDocument()
    })
  })

  it('shows the empty state when there are no watchlists', async () => {
    getWatchlistsMock.mockResolvedValue(createPage([]))

    renderWithProviders(
      <MemoryRouter>
        <WatchlistsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No watchlists yet')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /search titles/i })).toBeInTheDocument()
  })
})

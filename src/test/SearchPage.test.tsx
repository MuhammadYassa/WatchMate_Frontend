import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { SearchPage } from '../pages/SearchPage'
import { renderWithProviders } from './renderWithProviders'

const searchMediaMock = vi.fn()

vi.mock('../api/searchApi', () => ({
  searchApi: {
    searchMedia: (...args: unknown[]) => searchMediaMock(...args),
  },
}))

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchMediaMock.mockResolvedValue({
      currentPage: 1,
      searchResults: [
        {
          genres: ['Sci-Fi'],
          id: 77,
          mediaType: 'movie',
          overview: 'A simulation unfolds.',
          posterPath: '/matrix.jpg',
          releaseDate: '1999-03-31',
          title: 'The Matrix',
          voteAverage: 8.7,
        },
      ],
      totalPages: 1,
      totalResults: 1,
    })
  })

  it('debounces search requests and renders results', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/search']}>
        <SearchPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Search for a title'), {
      target: { value: 'matrix' },
    })

    expect(searchMediaMock).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(searchMediaMock).toHaveBeenCalledWith('matrix', 1)
    }, { timeout: 1500 })

    expect(await screen.findByText('The Matrix')).toBeInTheDocument()
    expect(window.localStorage.getItem('watchmate-recent-searches')).toContain('matrix')
  })
})

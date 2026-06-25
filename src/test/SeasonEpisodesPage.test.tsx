import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'

import { useAuthStore } from '../auth/authStore'
import { SeasonEpisodesPage } from '../pages/SeasonEpisodesPage'
import { renderWithProviders } from './renderWithProviders'
import type { ShowSeasonsDetailsDTO } from '../types/api'

const getSeasonEpisodesMock = vi.fn()

vi.mock('../api/showApi', () => ({
  showApi: {
    getSeasonEpisodes: (...args: unknown[]) => getSeasonEpisodesMock(...args),
  },
}))

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

  it('renders watched and unaired states without exposing tmdbEpisodeId', async () => {
    const season: ShowSeasonsDetailsDTO = {
      airDate: '2024-01-01',
      episodeCount: 2,
      episodes: [
        {
          airDate: '2024-01-01',
          episodeNumber: 1,
          isAired: true,
          name: 'Pilot',
          overview: 'The first special arrives.',
          runtime: 58,
          seasonNumber: 0,
          stillPath: '/pilot.jpg',
          tmdbEpisodeId: 9999,
          watched: true,
        },
        {
          airDate: '2026-12-01',
          episodeNumber: 2,
          isAired: false,
          name: 'Soon',
          overview: 'Not out yet.',
          runtime: 61,
          seasonNumber: 0,
          stillPath: null,
          tmdbEpisodeId: 10000,
          watched: false,
        },
      ],
      name: 'Specials',
      overview: 'Bonus material and event episodes.',
      posterPath: '/specials.jpg',
      seasonNumber: 0,
      tmdbId: 95396,
    }

    getSeasonEpisodesMock.mockResolvedValueOnce(season)

    renderWithProviders(
      <MemoryRouter initialEntries={['/shows/95396/seasons/0/episodes']}>
        <Routes>
          <Route
            element={<SeasonEpisodesPage />}
            path="/shows/:tmdbId/seasons/:seasonNumber/episodes"
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Specials' })).toBeInTheDocument()
    })

    expect(screen.getAllByText('Watched').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Unaired').length).toBeGreaterThan(0)
    expect(screen.getByText(/progress updates are set from the show page/i)).toBeInTheDocument()
    expect(screen.queryByText('9999')).not.toBeInTheDocument()
    expect(screen.queryByText('10000')).not.toBeInTheDocument()
  })
})

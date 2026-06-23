import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'

import { DashboardPage } from '../pages/DashboardPage'
import { renderWithProviders } from './renderWithProviders'

const getCalendarMock = vi.fn()
const getContinueWatchingMock = vi.fn()
const getUpcomingEpisodesMock = vi.fn()

vi.mock('../api/dashboardApi', () => ({
  dashboardApi: {
    getCalendar: (...args: unknown[]) => getCalendarMock(...args),
    getContinueWatching: (...args: unknown[]) => getContinueWatchingMock(...args),
    getUpcomingEpisodes: (...args: unknown[]) => getUpcomingEpisodesMock(...args),
  },
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders continue watching, upcoming episodes, and calendar items', async () => {
    getContinueWatchingMock.mockResolvedValue({
      items: [
        {
          backdropPath: '/backdrop.jpg',
          lastWatchedAt: null,
          nextEpisodeNumber: null,
          nextSeasonNumber: null,
          posterPath: '/poster.jpg',
          rating: 8.4,
          resumeEpisodeNumber: 4,
          resumeSeasonNumber: 2,
          title: 'Severance',
          tmdbId: 95396,
          type: 'SHOW',
          updatedAt: null,
          watchStatus: 'WATCHING',
        },
      ],
    })
    getUpcomingEpisodesMock.mockResolvedValue({
      items: [
        {
          backdropPath: null,
          daysUntilAirDate: 3,
          nextEpisodeAirDate: '2026-06-24',
          nextEpisodeEpisodeNumber: 5,
          nextEpisodeName: 'Cold Harbor',
          nextEpisodeSeasonNumber: 2,
          posterPath: '/poster.jpg',
          title: 'The Last of Us',
          tmdbId: 100088,
          tmdbShowStatus: 'Returning Series',
          type: 'SHOW',
        },
      ],
    })
    getCalendarMock.mockResolvedValue({
      items: [
        {
          airDate: '2026-06-24',
          backdropPath: null,
          episodeNumber: 5,
          episodeTitle: 'Cold Harbor',
          posterPath: '/poster.jpg',
          seasonNumber: 2,
          showStatus: 'Returning Series',
          title: 'The Last of Us',
          tmdbId: 100088,
          type: 'SHOW',
          watchStatus: 'WATCHING',
        },
      ],
    })

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Continue watching')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Severance' })).toBeInTheDocument()
    expect(screen.getByText('Upcoming episodes')).toBeInTheDocument()
    expect(screen.getAllByText('The Last of Us').length).toBeGreaterThan(0)
    expect(screen.getByText('Release calendar')).toBeInTheDocument()
    expect(screen.getAllByText('Cold Harbor').length).toBeGreaterThan(0)
  })

  it('shows the calendar empty state when no releases are scheduled', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Nothing lined up in this range')).toBeInTheDocument()
    })
  })
})

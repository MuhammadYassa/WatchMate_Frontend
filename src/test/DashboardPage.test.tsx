import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DashboardPage } from '../pages/DashboardPage'
import { renderWithProviders } from './renderWithProviders'

const getCalendarMock = vi.fn()
const getContinueWatchingMock = vi.fn()
const getUpcomingEpisodesMock = vi.fn()
const getToWatchItemsMock = vi.fn()

vi.mock('../api/dashboardApi', () => ({
  dashboardApi: {
    getCalendar: (...args: unknown[]) => getCalendarMock(...args),
    getContinueWatching: (...args: unknown[]) => getContinueWatchingMock(...args),
    getToWatchItems: (...args: unknown[]) => getToWatchItemsMock(...args),
    getUpcomingEpisodes: (...args: unknown[]) => getUpcomingEpisodesMock(...args),
  },
}))

const emptyPage = {
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

function makeToWatchPage(items: object[]) {
  return {
    content: items,
    empty: items.length === 0,
    first: true,
    last: true,
    number: 0,
    numberOfElements: items.length,
    size: 20,
    totalElements: items.length,
    totalPages: items.length > 0 ? 1 : 0,
  }
}

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
    getToWatchItemsMock.mockResolvedValue(emptyPage)

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Continue watching')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Severance' })).toBeInTheDocument()
    expect(screen.getByText('Next on your list')).toBeInTheDocument()
    expect(screen.getAllByText('The Last of Us').length).toBeGreaterThan(0)
    expect(screen.getByText('Release calendar')).toBeInTheDocument()
    expect(screen.getAllByText('Cold Harbor').length).toBeGreaterThan(0)
  })

  it('calls /dashboard/to-watch with default type=ALL', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(emptyPage)

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(getToWatchItemsMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ALL' }),
      )
    })
  })

  it('renders to-watch items', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(
      makeToWatchPage([
        {
          backdropPath: null,
          firstAirDate: null,
          posterPath: '/poster.jpg',
          rating: 7.8,
          releaseDate: '1999-10-15',
          title: 'Dune: Part Two',
          tmdbId: 693134,
          type: 'MOVIE',
          updatedAt: '2026-06-01T10:00:00',
          watchStatus: 'TO_WATCH',
        },
        {
          backdropPath: null,
          firstAirDate: '2024-04-11',
          posterPath: '/poster2.jpg',
          rating: 8.1,
          releaseDate: null,
          title: 'Fallout',
          tmdbId: 106379,
          type: 'SHOW',
          updatedAt: '2026-06-02T10:00:00',
          watchStatus: 'TO_WATCH',
        },
      ]),
    )

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Dune: Part Two')).toBeInTheDocument()
    })

    expect(screen.getByText('Fallout')).toBeInTheDocument()
    expect(screen.getByText('Plan to watch')).toBeInTheDocument()
  })

  it('renders the plan to watch empty state when list is empty', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(emptyPage)

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Nothing planned yet.')).toBeInTheDocument()
    })
  })

  it('filter buttons call getToWatchItems with MOVIE and SHOW type', async () => {
    const user = userEvent.setup()
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(emptyPage)

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Plan to watch')).toBeInTheDocument()
    })

    const moviesButton = screen.getByRole('button', { name: 'Movies' })
    await user.click(moviesButton)

    await waitFor(() => {
      expect(getToWatchItemsMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'MOVIE' }),
      )
    })

    const showsButton = screen.getByRole('button', { name: 'Shows' })
    await user.click(showsButton)

    await waitFor(() => {
      expect(getToWatchItemsMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SHOW' }),
      )
    })
  })

  it('to-watch items link to the correct movie and show detail routes', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(
      makeToWatchPage([
        {
          backdropPath: null,
          firstAirDate: null,
          posterPath: null,
          rating: null,
          releaseDate: '2021-10-22',
          title: 'Dune',
          tmdbId: 438631,
          type: 'MOVIE',
          updatedAt: '2026-06-01T10:00:00',
          watchStatus: 'TO_WATCH',
        },
        {
          backdropPath: null,
          firstAirDate: '2022-02-18',
          posterPath: null,
          rating: null,
          releaseDate: null,
          title: 'Severance',
          tmdbId: 95396,
          type: 'SHOW',
          updatedAt: '2026-06-02T10:00:00',
          watchStatus: 'TO_WATCH',
        },
      ]),
    )

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Dune')).toBeInTheDocument()
    })

    const duneLink = screen.getByRole('link', { name: /dune/i })
    expect(duneLink).toHaveAttribute('href', '/movies/438631')

    const severanceLink = screen.getByRole('link', { name: /severance/i })
    expect(severanceLink).toHaveAttribute('href', '/shows/95396')
  })

  it('shows the calendar empty state when no releases are scheduled', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(emptyPage)

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Nothing lined up in this range')).toBeInTheDocument()
    })
  })

  it('renders poster images for to-watch items that have a posterPath', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(
      makeToWatchPage([
        {
          backdropPath: null,
          firstAirDate: null,
          posterPath: '/poster.jpg',
          rating: 7.8,
          releaseDate: '1999-10-15',
          title: 'Dune: Part Two',
          tmdbId: 693134,
          type: 'MOVIE',
          updatedAt: '2026-06-01T10:00:00',
          watchStatus: 'TO_WATCH',
        },
      ]),
    )

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Dune: Part Two')).toBeInTheDocument()
    })

    const posterImg = screen.getByAltText('Dune: Part Two')
    expect(posterImg).toBeInTheDocument()
    expect(posterImg).toHaveAttribute('src', expect.stringContaining('/poster.jpg'))
    expect(posterImg).toHaveAttribute('src', expect.stringContaining('w92'))
  })

  it('renders a text fallback for to-watch items without a posterPath', async () => {
    getContinueWatchingMock.mockResolvedValue({ items: [] })
    getUpcomingEpisodesMock.mockResolvedValue({ items: [] })
    getCalendarMock.mockResolvedValue({ items: [] })
    getToWatchItemsMock.mockResolvedValue(
      makeToWatchPage([
        {
          backdropPath: null,
          firstAirDate: null,
          posterPath: null,
          rating: null,
          releaseDate: '1999-10-15',
          title: 'Fight Club',
          tmdbId: 550,
          type: 'MOVIE',
          updatedAt: '2026-06-01T10:00:00',
          watchStatus: 'TO_WATCH',
        },
      ]),
    )

    renderWithProviders(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Fight Club')).toBeInTheDocument()
    })

    expect(screen.queryByAltText('Fight Club')).not.toBeInTheDocument()
    expect(screen.getByText('FC')).toBeInTheDocument()
  })
})

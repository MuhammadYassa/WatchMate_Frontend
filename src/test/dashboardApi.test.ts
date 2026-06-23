import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../api/client'
import { dashboardApi } from '../api/dashboardApi'
import type { CalendarResponseDTO, UpcomingEpisodesResponseDTO } from '../types/api'

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const mockedApiClient = vi.mocked(apiClient)

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets upcoming episodes', async () => {
    const upcoming: UpcomingEpisodesResponseDTO = {
      items: [],
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: upcoming,
      headers: new Headers(),
      status: 200,
    })

    await expect(dashboardApi.getUpcomingEpisodes()).resolves.toEqual(upcoming)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/dashboard/upcoming-episodes')
  })

  it('gets the release calendar for a date range', async () => {
    const calendar: CalendarResponseDTO = {
      items: [],
    }

    mockedApiClient.get.mockResolvedValueOnce({
      data: calendar,
      headers: new Headers(),
      status: 200,
    })

    await expect(dashboardApi.getCalendar('2026-06-21', '2026-07-21')).resolves.toEqual(calendar)
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/dashboard/calendar?from=2026-06-21&to=2026-07-21',
    )
  })
})

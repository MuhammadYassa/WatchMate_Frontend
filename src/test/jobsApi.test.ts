import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getShowJobPollingTarget, pollShowTrackingJob } from '../api/jobsApi'
import type { ApiResult } from '../api/client'
import type { ShowTrackingJobDTO } from '../types/api'

function createJob(status: ShowTrackingJobDTO['status']): ShowTrackingJobDTO {
  return {
    completedAt: null,
    completedSeasons: null,
    createdAt: '2026-06-20T10:00:00',
    errorCode: null,
    errorMessage: null,
    finalStatus: null,
    jobId: 9,
    jobType: 'SET_SHOW_PROGRESS',
    mediaId: 4,
    message: null,
    requestedStatus: 'WATCHING',
    startedAt: null,
    status,
    targetEpisodeNumber: 6,
    targetSeasonNumber: 2,
    tmdbId: 1399,
    totalSeasons: 8,
    updatedAt: '2026-06-20T10:00:00',
  }
}

function createResult(
  job: ShowTrackingJobDTO,
  headers?: Record<string, string>,
): ApiResult<ShowTrackingJobDTO> {
  return {
    data: job,
    headers: new Headers(headers),
    status: 202,
  }
}

describe('jobsApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('prefers the readable Location header and Retry-After value', () => {
    const target = getShowJobPollingTarget(
      createResult(createJob('PENDING'), {
        Location: '/api/v1/show-tracking-jobs/9',
        'Retry-After': '5',
      }),
    )

    expect(target.path).toBe('/api/v1/show-tracking-jobs/9')
    expect(target.intervalMs).toBe(5000)
  })

  it('falls back to jobId and a 2 second interval when headers are unreadable', () => {
    const target = getShowJobPollingTarget(createResult(createJob('PENDING')))

    expect(target.path).toBe('/show-tracking-jobs/9')
    expect(target.intervalMs).toBe(2000)
  })

  it('polls until the job completes', async () => {
    const client = {
      get: vi.fn().mockResolvedValue(createResult(createJob('COMPLETED'))),
    }

    const polling = pollShowTrackingJob(createResult(createJob('RUNNING')), { client, maxAttempts: 2 })

    await vi.advanceTimersByTimeAsync(2000)
    const result = await polling

    expect(client.get).toHaveBeenCalledWith('/show-tracking-jobs/9')
    expect(result.status).toBe('COMPLETED')
  })
})

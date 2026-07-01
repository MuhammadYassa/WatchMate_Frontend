import { apiClient, type ApiResult } from './client'
import type { ShowTrackingJobDTO } from '../types/api'

export interface ShowJobPollingTarget {
  intervalMs: number
  jobId: number
  path: string
}

const API_PREFIX = '/api/v1'

export function getShowJobPollingTarget(
  result: ApiResult<ShowTrackingJobDTO>,
): ShowJobPollingTarget {
  const rawLocation = result.headers.get('Location')
  const location = rawLocation?.startsWith(API_PREFIX)
    ? rawLocation.slice(API_PREFIX.length)
    : rawLocation
  const retryAfter = Number.parseInt(result.headers.get('Retry-After') ?? '', 10)
  const intervalMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 2000
  const fallbackPath = `/show-tracking-jobs/${result.data.jobId}`

  return {
    intervalMs,
    jobId: result.data.jobId,
    path: location ?? fallbackPath,
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function pollShowTrackingJob(
  initialResult: ApiResult<ShowTrackingJobDTO>,
  options?: {
    client?: Pick<typeof apiClient, 'get'>
    maxAttempts?: number
    signal?: AbortSignal
  },
) {
  const client = options?.client ?? apiClient
  const maxAttempts = options?.maxAttempts ?? 30
  const target = getShowJobPollingTarget(initialResult)
  let current = initialResult.data

  if (current.status === 'COMPLETED' || current.status === 'FAILED') {
    return current
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (options?.signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError')
    }

    await wait(target.intervalMs)

    const next = await client.get<ShowTrackingJobDTO>(target.path)
    current = next.data

    if (current.status === 'COMPLETED' || current.status === 'FAILED') {
      return current
    }
  }

  return current
}

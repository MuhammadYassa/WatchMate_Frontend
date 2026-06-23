import type {
  FollowStatuses,
  MediaType,
  PrivacyStatuses,
  ShowTrackingJobStatus,
  WatchStatus,
} from '../types/enums'

export function formatWatchStatus(status: WatchStatus) {
  const labels: Record<WatchStatus, string> = {
    NONE: 'Not tracking',
    TO_WATCH: 'Plan to watch',
    WATCHING: 'Watching',
    UP_TO_DATE: 'Up to date',
    WATCHED: 'Watched',
  }

  return labels[status]
}

export function formatMediaType(type: MediaType) {
  return type === 'MOVIE' ? 'Movie' : 'Show'
}

export function formatFavouriteState(isFavourited: boolean | null | undefined) {
  if (isFavourited === null || isFavourited === undefined) {
    return null
  }

  return isFavourited ? 'In favourites' : 'Not in favourites'
}

export function formatSeasonLabel(seasonNumber: number) {
  return seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`
}

export function formatEpisodeLabel(episodeNumber: number) {
  return `Episode ${episodeNumber}`
}

export function formatAiredState(isAired: boolean | null | undefined) {
  if (isAired === false) {
    return 'Unaired'
  }

  if (isAired === true) {
    return 'Aired'
  }

  return 'Air date pending'
}

export function formatWatchedState(watched: boolean | null | undefined) {
  if (watched === true) {
    return 'Watched'
  }

  if (watched === false) {
    return 'Not watched yet'
  }

  return null
}

export function formatRuntime(runtime: number | null | undefined) {
  if (!runtime || runtime <= 0) {
    return 'Runtime unavailable'
  }

  return `${runtime} min`
}

export function formatReviewCount(count: number) {
  return count === 1 ? '1 review' : `${count} reviews`
}

export function formatTmdbShowStatus(status: string | null | undefined) {
  if (!status) {
    return null
  }

  return status
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatFollowStatus(status: FollowStatuses) {
  const labels: Record<FollowStatuses, string> = {
    BLOCKED: 'Blocked',
    FOLLOWING: 'Following',
    NOT_FOLLOWING: 'Not following',
    REQUESTED: 'Requested',
  }

  return labels[status]
}

export function formatPrivacyStatus(status: PrivacyStatuses) {
  return status === 'PRIVATE' ? 'Private profile' : 'Public profile'
}

export function formatJobStatus(status: ShowTrackingJobStatus) {
  const labels: Record<ShowTrackingJobStatus, string> = {
    COMPLETED: 'Complete',
    FAILED: 'Could not finish',
    PENDING: 'Preparing',
    RUNNING: 'Updating',
  }

  return labels[status]
}

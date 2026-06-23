export type MediaType = 'MOVIE' | 'SHOW'

export type WatchStatus =
  | 'NONE'
  | 'TO_WATCH'
  | 'WATCHING'
  | 'UP_TO_DATE'
  | 'WATCHED'

export type PrivacyStatuses = 'PUBLIC' | 'PRIVATE'

export type FollowStatuses =
  | 'FOLLOWING'
  | 'NOT_FOLLOWING'
  | 'BLOCKED'
  | 'REQUESTED'

export type FollowRequestStatuses =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELED'

export type ShowTrackingJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'

export type ShowTrackingJobType =
  | 'HYDRATE_SHOW_CATALOG'
  | 'MARK_SHOW_WATCHED'
  | 'MARK_SHOW_UP_TO_DATE'
  | 'SET_SHOW_PROGRESS'

export type Role = 'USER' | 'MODERATOR' | 'ADMIN'

export type SearchMediaType = 'movie' | 'tv'

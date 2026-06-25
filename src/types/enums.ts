export type MediaType = 'MOVIE' | 'SHOW'

export type WatchStatus =
  | 'NONE'
  | 'TO_WATCH'
  | 'WATCHING'
  | 'UP_TO_DATE'
  | 'WATCHED'

export type PrivacyStatus = 'PUBLIC' | 'PRIVATE'

export type PrivacyStatuses = PrivacyStatus

export type FollowStatus =
  | 'FOLLOWING'
  | 'NOT_FOLLOWING'
  | 'REQUESTED'
  | 'BLOCKED'
  | 'SELF'

export type FollowStatuses = FollowStatus

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

import type {
  FollowRequestStatuses,
  FollowStatuses,
  MediaType,
  PrivacyStatuses,
  Role,
  SearchMediaType,
  ShowTrackingJobStatus,
  ShowTrackingJobType,
  WatchStatus,
} from './enums'

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface LoginRequestDTO {
  username: string
  password: string
}

export interface RegisterRequestDTO {
  username: string
  email: string
  password: string
}

export interface RefreshTokenRequestDTO {
  refreshToken: string
}

export interface LogoutRequestDTO {
  refreshToken: string
}

export interface LoginResponseDTO {
  accessToken: string
  refreshToken: string
  accessTokenExpiry: string
  tokenType: string
}

export interface ReviewResponseDTO {
  username: string
  comment: string
  starRating: number
  reviewId: number
  tmdbId: number
  postedAt: string
  updatedAt: string
}

export interface CreateReviewRequestDTO {
  comment: string
  starRating: number
  tmdbId: number
  type: MediaType
}

export interface UpdateReviewRequestDTO {
  comment: string
  starRating: number
}

export interface DiscoveryMediaItemDTO {
  tmdbId: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  rating: number | null
  type: MediaType
}

export interface HomeResponseDTO {
  trendingMovies: DiscoveryMediaItemDTO[]
  trendingShows: DiscoveryMediaItemDTO[]
  popularNow: DiscoveryMediaItemDTO[]
  airingToday: DiscoveryMediaItemDTO[]
  upcoming: DiscoveryMediaItemDTO[]
  recommendedLater: DiscoveryMediaItemDTO[]
  movieGenres: string[]
  showGenres: string[]
}

export interface HomeStatusDTO {
  healthy: boolean
  lastSyncAt: string | null
}

export interface GenreBrowseResponseDTO {
  genre: string
  mediaType: MediaType
  results: DiscoveryMediaItemDTO[]
  currentPage: number
  totalPages: number
  totalResults: number
}

export interface SearchItemDTO {
  id: number
  title: string
  overview: string
  mediaType: SearchMediaType
  posterPath: string | null
  releaseDate: string | null
  voteAverage: number | null
  genres: string[]
}

export interface PaginatedSearchResponseDTO {
  searchResults: SearchItemDTO[]
  currentPage: number
  totalPages: number
  totalResults: number
}

export interface MediaDetailsDTO {
  tmdbId: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  rating: number | null
  type: MediaType
  genres: string[]
  reviews: ReviewResponseDTO[]
  isFavourited: boolean | null
  watchStatus: WatchStatus | null
}

export interface MovieDetailsDTO {
  tmdbId: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  rating: number | null
  type: MediaType
  genres: string[]
  reviews: ReviewResponseDTO[]
  isFavourited: boolean | null
  watchStatus: WatchStatus | null
}

export interface ShowSeasonSummaryDTO {
  seasonNumber: number
  name: string
  episodeCount: number
  posterPath: string | null
  airDate: string | null
}

export interface ShowDetailsDTO {
  tmdbId: number
  type: MediaType
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  firstAirDate: string | null
  rating: number | null
  genres: string[]
  reviews: ReviewResponseDTO[]
  numberOfSeasons: number | null
  numberOfEpisodes: number | null
  lastAirDate: string | null
  tmdbShowStatus: string | null
  nextEpisodeAirDate: string | null
  nextEpisodeSeasonNumber: number | null
  nextEpisodeEpisodeNumber: number | null
  nextEpisodeName: string | null
  lastEpisodeToAirSeasonNumber: number | null
  lastEpisodeToAirEpisodeNumber: number | null
  lastEpisodeToAirName: string | null
  seasons: ShowSeasonSummaryDTO[]
  isFavourited: boolean | null
  watchStatus: WatchStatus | null
}

export interface ShowEpisodeDetailsDTO {
  tmdbEpisodeId: number | null
  seasonNumber: number
  episodeNumber: number
  name: string
  overview: string
  airDate: string | null
  runtime: number | null
  stillPath: string | null
  isAired: boolean | null
  watched: boolean | null
}

export interface ShowSeasonsDetailsDTO {
  tmdbId: number
  seasonNumber: number
  name: string
  overview: string
  posterPath: string | null
  airDate: string | null
  episodeCount: number
  episodes: ShowEpisodeDetailsDTO[]
}

export interface NextEpisodeAiringDTO {
  tmdbId: number
  nextEpisodeAirDate: string | null
  seasonNumber: number | null
  episodeNumber: number | null
  episodeName: string | null
  lastEpisodeToAirSeasonNumber: number | null
  lastEpisodeToAirEpisodeNumber: number | null
  lastEpisodeToAirName: string | null
}

export interface WatchedEpisodeDTO {
  seasonNumber: number
  episodeNumber: number
  watchedAt: string
}

export interface ShowTrackingDTO {
  tmdbId: number
  type: MediaType
  status: WatchStatus
  watchPositionSeason: number | null
  watchPositionEpisode: number | null
  latestWatchedSeason: number | null
  latestWatchedEpisode: number | null
  episodesWatchedCount: number
  seasonsCompletedCount: number
  completed: boolean
  watchedEpisodes: WatchedEpisodeDTO[]
}

export interface UpdateShowTrackingPositionRequestDTO {
  watchPositionSeason: number
  watchPositionEpisode: number
}

export interface UserMediaStatusDTO {
  tmdbId: number
  status: WatchStatus
}

export interface ShowTrackingStatusDTO {
  tmdbId: number
  status: WatchStatus
}

export interface UpdateWatchStatusRequestDTO {
  status: WatchStatus
}

export interface ShowTrackingJobDTO {
  jobId: number
  status: ShowTrackingJobStatus
  jobType: ShowTrackingJobType
  mediaId: number | null
  tmdbId: number
  message: string | null
  totalSeasons: number | null
  completedSeasons: number | null
  requestedStatus: WatchStatus | null
  targetSeasonNumber: number | null
  targetEpisodeNumber: number | null
  errorCode: string | null
  errorMessage: string | null
  finalStatus: WatchStatus | null
  createdAt: string
  updatedAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface WatchListDTO {
  id: number
  name: string
  media: MediaDetailsDTO[]
}

export interface CreateWatchListDTO {
  name: string
}

export interface RenameWatchListDTO {
  newName: string
}

export interface FavouriteStatusDTO {
  tmdbId: number
  isFavourited: boolean
}

export interface UserFavouritesDTO {
  favourites: MediaDetailsDTO[]
  totalCount: number
}

export interface ContinueWatchingItemDTO {
  tmdbId: number
  type: MediaType
  title: string
  posterPath: string | null
  backdropPath: string | null
  watchStatus: WatchStatus
  resumeSeasonNumber: number | null
  resumeEpisodeNumber: number | null
  nextSeasonNumber: number | null
  nextEpisodeNumber: number | null
  lastWatchedAt: string | null
  updatedAt: string | null
  rating: number | null
}

export interface ContinueWatchingResponseDTO {
  items: ContinueWatchingItemDTO[]
}

export interface UpcomingEpisodeItemDTO {
  tmdbId: number
  type: MediaType
  title: string
  posterPath: string | null
  backdropPath: string | null
  nextEpisodeSeasonNumber: number | null
  nextEpisodeEpisodeNumber: number | null
  nextEpisodeName: string | null
  nextEpisodeAirDate: string | null
  daysUntilAirDate: number | null
  tmdbShowStatus: string | null
}

export interface UpcomingEpisodesResponseDTO {
  items: UpcomingEpisodeItemDTO[]
}

export interface CalendarItemDTO {
  airDate: string
  tmdbId: number
  type: MediaType
  title: string
  posterPath: string | null
  backdropPath: string | null
  seasonNumber: number | null
  episodeNumber: number | null
  episodeTitle: string | null
  showStatus: string | null
  watchStatus: WatchStatus
}

export interface CalendarResponseDTO {
  items: CalendarItemDTO[]
}

export interface FollowStatusDTO {
  followStatus: FollowStatuses
}

export interface FollowRequestDTO {
  requestId: number
  requesterUserId: number
  targetUserId: number
  requesterUsername: string
  targetUsername: string
  requestedAt: string
  status: FollowRequestStatuses
}

export interface FollowRequestResponseDTO {
  requestId: number
  newStatus: FollowRequestStatuses
}

export interface SearchListUserDetailsDTO {
  userId: number
  username: string
  isFollowing: boolean | null
  isSelf: boolean
  privacyStatus: PrivacyStatuses
}

export interface FollowListUserDetailsDTO {
  userId: number
  username: string
}

export interface UserProfileDTO {
  userId: number
  username: string
  followersCount: number
  followingCount: number
  watchlists?: SpringPage<WatchListDTO>
  reviews?: SpringPage<ReviewResponseDTO>
  moviesWatchedCount?: number
  showsWatchedCount?: number
  moviesWatched?: SpringPage<SearchItemDTO>
  showsWatched?: SpringPage<SearchItemDTO>
  followStatus: FollowStatuses
  privacyStatus: PrivacyStatuses
}

export interface UserIdentitySnapshot {
  username: string | null
  role: Role | null
}

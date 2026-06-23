import type { MediaType, SearchMediaType } from '../types/enums'

export function getMediaRoute(tmdbId: number, mediaType: MediaType) {
  return mediaType === 'MOVIE' ? `/movies/${tmdbId}` : `/shows/${tmdbId}`
}

export function getSearchResultRoute(id: number, mediaType: SearchMediaType) {
  return mediaType === 'movie' ? `/movies/${id}` : `/shows/${id}`
}

const TMDB_IMAGE_BASE_URL =
  import.meta.env.VITE_TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p'

type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'
type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original'
type StillSize = 'w92' | 'w185' | 'w300' | 'original'

function buildImageUrl(path: string | null | undefined, size: string) {
  if (!path) {
    return null
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export function getPosterUrl(path: string | null | undefined, size: PosterSize = 'w342') {
  return buildImageUrl(path, size)
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: BackdropSize = 'w1280',
) {
  return buildImageUrl(path, size)
}

export function getStillUrl(path: string | null | undefined, size: StillSize = 'w300') {
  return buildImageUrl(path, size)
}

export function getTitleInitials(title: string) {
  return title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('')
}

export function hasImagePath(path: string | null | undefined) {
  return Boolean(path)
}

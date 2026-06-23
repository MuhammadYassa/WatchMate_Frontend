const RECENT_SEARCHES_KEY = 'watchmate-recent-searches'
const MAX_RECENT_SEARCHES = 6

export function readRecentSearches() {
  if (typeof window === 'undefined') {
    return [] as string[]
  }

  try {
    const value = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!value) {
      return []
    }

    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function writeRecentSearch(search: string) {
  if (typeof window === 'undefined') {
    return
  }

  const normalized = search.trim()
  if (!normalized) {
    return
  }

  const next = [normalized, ...readRecentSearches().filter((item) => item !== normalized)].slice(
    0,
    MAX_RECENT_SEARCHES,
  )
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(RECENT_SEARCHES_KEY)
}

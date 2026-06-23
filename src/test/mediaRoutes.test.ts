import { describe, expect, it } from 'vitest'

import { getMediaRoute, getSearchResultRoute } from '../utils/mediaRoutes'

describe('mediaRoutes', () => {
  it('routes typed media detail links', () => {
    expect(getMediaRoute(101, 'MOVIE')).toBe('/movies/101')
    expect(getMediaRoute(202, 'SHOW')).toBe('/shows/202')
  })

  it('preserves search result media types for routing', () => {
    expect(getSearchResultRoute(303, 'movie')).toBe('/movies/303')
    expect(getSearchResultRoute(404, 'tv')).toBe('/shows/404')
  })
})

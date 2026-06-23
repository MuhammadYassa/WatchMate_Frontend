import { describe, expect, it } from 'vitest'

import { getBackdropUrl, getPosterUrl, getStillUrl, getTitleInitials, hasImagePath } from '../utils/tmdbImages'

describe('tmdbImages', () => {
  it('builds TMDB asset URLs', () => {
    expect(getPosterUrl('/poster.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/poster.jpg')
    expect(getBackdropUrl('/backdrop.jpg', 'w1280')).toBe(
      'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
    )
    expect(getStillUrl('/still.jpg', 'w300')).toBe('https://image.tmdb.org/t/p/w300/still.jpg')
  })

  it('returns null for missing image paths', () => {
    expect(getPosterUrl(null)).toBeNull()
    expect(hasImagePath(undefined)).toBe(false)
  })

  it('creates stable title initials for poster fallbacks', () => {
    expect(getTitleInitials('Dune Part Two')).toBe('DP')
  })
})

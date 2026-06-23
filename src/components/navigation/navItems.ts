export type NavIcon =
  | 'sparkles'
  | 'clapperboard'
  | 'compass'
  | 'search'
  | 'log-in'
  | 'user'
  | 'layout-dashboard'
  | 'bookmark'

export const publicDesktopNavItems = [
  { label: 'Landing', to: '/' },
  { label: 'Home', to: '/home' },
  { label: 'Discover', to: '/discover' },
  { label: 'Search', to: '/search' },
]

export const privateDesktopNavItems = [
  { label: 'Home', to: '/home' },
  { label: 'Discover', to: '/discover' },
  { label: 'Search', to: '/search' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Watchlists', to: '/watchlists' },
  { label: 'Favourites', to: '/favourites' },
]

export const publicMobileNavItems: Array<{ icon: NavIcon; label: string; to: string }> = [
  { icon: 'sparkles', label: 'Landing', to: '/' },
  { icon: 'clapperboard', label: 'Home', to: '/home' },
  { icon: 'compass', label: 'Discover', to: '/discover' },
  { icon: 'search', label: 'Search', to: '/search' },
  { icon: 'log-in', label: 'Log in', to: '/login' },
]

export const privateMobileNavItems: Array<{ icon: NavIcon; label: string; to: string }> = [
  { icon: 'clapperboard', label: 'Home', to: '/home' },
  { icon: 'search', label: 'Search', to: '/search' },
  { icon: 'layout-dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'bookmark', label: 'Lists', to: '/watchlists' },
  { icon: 'user', label: 'Profile', to: '/profile' },
]

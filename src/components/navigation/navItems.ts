export type NavIcon =
  | 'sparkles'
  | 'clapperboard'
  | 'compass'
  | 'search'
  | 'log-in'
  | 'user'
  | 'layout-dashboard'
  | 'bookmark'
  | 'heart'
  | 'users'
  | 'bell'

export interface DesktopNavItem {
  label: string
  to: string
}

export interface IconNavItem extends DesktopNavItem {
  icon: NavIcon
}

export const publicDesktopNavItems: DesktopNavItem[] = [
  { label: 'Landing', to: '/' },
  { label: 'Home', to: '/home' },
  { label: 'Discover', to: '/discover' },
  { label: 'Search', to: '/search' },
]

export const privateDesktopBrowseNavItems: DesktopNavItem[] = [
  { label: 'Home', to: '/home' },
  { label: 'Discover', to: '/discover' },
  { label: 'Search', to: '/search' },
]

export const privateDesktopUtilityNavItems: DesktopNavItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Watchlists', to: '/watchlists' },
  { label: 'Favourites', to: '/favourites' },
]

export const privateDesktopNavItems: DesktopNavItem[] = [
  ...privateDesktopBrowseNavItems,
  ...privateDesktopUtilityNavItems,
]

export const privateDesktopSideRailPrimaryItems: IconNavItem[] = [
  { icon: 'layout-dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'bookmark', label: 'Watchlists', to: '/watchlists' },
  { icon: 'heart', label: 'Favourites', to: '/favourites' },
]

export const privateDesktopSideRailSecondaryItems: IconNavItem[] = [
  { icon: 'clapperboard', label: 'Home', to: '/home' },
  { icon: 'compass', label: 'Discover', to: '/discover' },
  { icon: 'search', label: 'Search', to: '/search' },
  { icon: 'users', label: 'Social Search', to: '/social/search' },
  { icon: 'bell', label: 'Follow Requests', to: '/follow-requests' },
]

export const publicMobileNavItems: IconNavItem[] = [
  { icon: 'sparkles', label: 'Landing', to: '/' },
  { icon: 'clapperboard', label: 'Home', to: '/home' },
  { icon: 'compass', label: 'Discover', to: '/discover' },
  { icon: 'search', label: 'Search', to: '/search' },
  { icon: 'log-in', label: 'Log in', to: '/login' },
]

export const privateMobileNavItems: IconNavItem[] = [
  { icon: 'clapperboard', label: 'Home', to: '/home' },
  { icon: 'search', label: 'Search', to: '/search' },
  { icon: 'layout-dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'bookmark', label: 'Lists', to: '/watchlists' },
  { icon: 'user', label: 'Profile', to: '/profile' },
]

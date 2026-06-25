export type ShellMode = 'topbar' | 'side-rail'

const sideRailPrefixes = ['/social/profile/']
const sideRailRoutes = new Set([
  '/dashboard',
  '/favourites',
  '/follow-requests',
  '/profile',
  '/social/search',
  '/watchlists',
])

export function getShellMode(pathname: string): ShellMode {
  if (sideRailRoutes.has(pathname) || sideRailPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return 'side-rail'
  }

  return 'topbar'
}

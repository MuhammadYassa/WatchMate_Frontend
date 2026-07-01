import {
  Bell,
  Bookmark,
  Clapperboard,
  Compass,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { cn } from '../../utils/cn'
import { Logo } from '../branding/Logo'
import { getButtonClassName } from '../ui/buttonStyles'
import type { ShellMode } from '../layout/shellMode'
import { getShellMode } from '../layout/shellMode'
import {
  privateDesktopBrowseNavItems,
  privateDesktopSideRailPrimaryItems,
  privateDesktopSideRailSecondaryItems,
  privateDesktopUtilityNavItems,
  publicDesktopNavItems,
} from './navItems'

const iconMap = {
  bell: Bell,
  bookmark: Bookmark,
  clapperboard: Clapperboard,
  compass: Compass,
  heart: Heart,
  'layout-dashboard': LayoutDashboard,
  'log-in': LogIn,
  search: Search,
  sparkles: Sparkles,
  user: UserRound,
  users: Users,
}

export function DesktopNav({ mode }: { mode?: ShellMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const username = useAuthStore((state) => state.username)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const shellMode = mode ?? getShellMode(location.pathname)
  const browseNavItems = isAuthenticated && username ? privateDesktopBrowseNavItems : publicDesktopNavItems

  function handleLogout() {
    clearAuth()
    navigate('/')
  }

  if (shellMode === 'side-rail' && isAuthenticated && username) {
    return (
      <aside className="motion-slide-up fixed inset-y-0 left-0 z-40 hidden w-[var(--shell-side-rail-width)] border-r border-white/8 bg-[linear-gradient(180deg,rgba(15,14,12,0.94)_0%,rgba(9,8,7,0.99)_100%)] px-5 py-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl md:flex md:flex-col">
        <div className="px-1">
          <Logo size="lg" to="/dashboard" />
        </div>

        <div className="mt-7 space-y-6 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <nav className="space-y-1.5">
              {privateDesktopSideRailPrimaryItems.map((item) => {
                const Icon = iconMap[item.icon]

                return (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-[14px] border px-3.5 py-3 text-sm transition duration-300',
                        isActive
                          ? 'border-[rgba(47,174,126,0.20)] bg-[linear-gradient(135deg,rgba(47,174,126,0.12)_0%,rgba(47,174,126,0.04)_100%)] text-white shadow-[0_12px_28px_rgba(47,174,126,0.10)]'
                          : 'border-transparent text-[color:var(--color-text-secondary)] hover:border-white/8 hover:bg-white/[0.04] hover:text-white',
                      )
                    }
                    to={item.to}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            'motion-nav-indicator absolute inset-y-2 left-0 w-[3px] rounded-full bg-[color:var(--color-accent)]',
                            isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0',
                          )}
                        />
                        <Icon
                          aria-hidden="true"
                          className={cn(
                            'size-4 shrink-0 transition duration-300',
                            isActive ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-tertiary)] group-hover:text-white',
                          )}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="space-y-1.5">
            <nav className="space-y-1.5">
              {privateDesktopSideRailSecondaryItems.map((item) => {
                const Icon = iconMap[item.icon]

                return (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-[14px] border px-3.5 py-3 text-sm transition duration-300',
                        isActive
                          ? 'border-white/10 bg-white/[0.05] text-white'
                          : 'border-transparent text-[color:var(--color-text-secondary)] hover:border-white/8 hover:bg-white/[0.03] hover:text-white',
                      )
                    }
                    to={item.to}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[color:var(--color-text-tertiary)] transition duration-300 group-hover:text-white"
                    />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <NavLink className={getButtonClassName('secondary', 'w-full justify-start gap-2 px-4')} to="/profile">
            <UserRound aria-hidden="true" className="size-4" />
            {username}
          </NavLink>
          <button
            className={getButtonClassName('ghost', 'w-full justify-start gap-2 px-4')}
            onClick={handleLogout}
            type="button"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Log out
          </button>
        </div>
      </aside>
    )
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/8 bg-[rgba(12,11,10,0.80)] backdrop-blur-xl md:block">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-4 xl:px-12">
        <Logo size="lg" to={isAuthenticated ? '/home' : '/'} />
        <nav className="flex items-center gap-1.5">
          {browseNavItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-[12px] border border-transparent px-3.5 py-2.5 text-sm text-[color:var(--color-text-secondary)] transition duration-300 hover:bg-white/[0.04] hover:text-white',
                  isActive
                    ? 'border-white/8 bg-[rgba(47,174,126,0.08)] text-white shadow-[0_0_0_1px_rgba(47,174,126,0.08)_inset]'
                    : '',
                )
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          {isAuthenticated && username ? (
            <>
              <nav className="flex items-center gap-1">
                {privateDesktopUtilityNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-[12px] border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)] transition duration-300 hover:text-white',
                        isActive ? 'border-white/8 bg-white/[0.05] text-[color:var(--color-accent)]' : '',
                      )
                    }
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <NavLink className={getButtonClassName('secondary', 'min-h-10 px-4 py-2')} to="/profile">
                {username}
              </NavLink>
              <button
                aria-label="Log out"
                className={getButtonClassName('ghost', 'min-h-10 px-3 py-2')}
                onClick={handleLogout}
                type="button"
              >
                <LogOut aria-hidden="true" className="size-4" />
              </button>
            </>
          ) : (
            <>
              <NavLink className={getButtonClassName('ghost', 'min-h-10 px-4 py-2')} to="/login">
                Log in
              </NavLink>
              <NavLink className={getButtonClassName('primary', 'min-h-10 px-4 py-2')} to="/register">
                Start tracking
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

import {
  Bell,
  Bookmark,
  Clapperboard,
  Compass,
  Heart,
  LayoutDashboard,
  LogIn,
  Search,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { cn } from '../../utils/cn'
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
  const username = useAuthStore((state) => state.username)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const shellMode = mode ?? getShellMode(location.pathname)
  const browseNavItems = isAuthenticated && username ? privateDesktopBrowseNavItems : publicDesktopNavItems

  if (shellMode === 'side-rail' && isAuthenticated && username) {
    return (
      <aside className="motion-slide-up fixed inset-y-0 left-0 z-40 hidden w-[var(--shell-side-rail-width)] border-r border-white/8 bg-[linear-gradient(180deg,rgba(18,19,23,0.92)_0%,rgba(12,13,16,0.98)_100%)] px-5 py-5 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl md:flex md:flex-col">
        <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
          <NavLink className="flex items-center gap-3" to="/dashboard">
            <span className="flex size-11 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(216,226,255,0.1)] font-display text-lg text-[color:var(--color-accent)]">
              W
            </span>
            <div className="min-w-0">
              <div className="font-display text-[1.9rem] leading-none tracking-[-0.05em] text-white">
                WatchMate
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
                Nocturne library
              </p>
            </div>
          </NavLink>
        </div>

        <div className="mt-7 space-y-6 overflow-y-auto pr-1">
          <div className="space-y-2">
            <p className="px-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-tertiary)]">
              Library
            </p>
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
                          ? 'border-[rgba(173,198,255,0.18)] bg-[linear-gradient(135deg,rgba(216,226,255,0.16)_0%,rgba(173,198,255,0.06)_100%)] text-white shadow-[0_12px_28px_rgba(173,198,255,0.1)]'
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

          <div className="space-y-2">
            <p className="px-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-tertiary)]">
              Browse
            </p>
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

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
              Signed in
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
              Move between your shelves, queue, and social pages without leaving the cinematic shell.
            </p>
          </div>
          <NavLink className={getButtonClassName('secondary', 'w-full justify-start gap-2 px-4')} to="/profile">
            <UserRound aria-hidden="true" className="size-4" />
            {username}
          </NavLink>
        </div>
      </aside>
    )
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/8 bg-[rgba(12,13,17,0.78)] backdrop-blur-xl md:block">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-4 xl:px-12">
        <NavLink className="flex items-center gap-3" to={isAuthenticated ? '/home' : '/'}>
          <span className="flex size-10 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(216,226,255,0.08)] font-display text-lg text-[color:var(--color-accent)]">
            W
          </span>
          <div className="space-y-1">
            <div className="font-display text-[1.9rem] leading-none tracking-[-0.05em] text-white">
              WatchMate
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
              Nocturne cinema
            </p>
          </div>
        </NavLink>
        <nav className="flex items-center gap-1.5">
          {browseNavItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-[12px] border border-transparent px-3.5 py-2.5 text-sm text-[color:var(--color-text-secondary)] transition duration-300 hover:bg-white/[0.04] hover:text-white',
                  isActive
                    ? 'border-white/8 bg-[rgba(216,226,255,0.08)] text-white shadow-[0_0_0_1px_rgba(173,198,255,0.08)_inset]'
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

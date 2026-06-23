import { NavLink } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { cn } from '../../utils/cn'
import { getButtonClassName } from '../ui/buttonStyles'
import { privateDesktopNavItems, publicDesktopNavItems } from './navItems'

export function DesktopNav() {
  const username = useAuthStore((state) => state.username)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const navItems = isAuthenticated && username ? privateDesktopNavItems : publicDesktopNavItems

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/10 bg-[rgba(18,19,23,0.82)] backdrop-blur-2xl md:block">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-4 xl:px-12">
        <NavLink className="flex items-center gap-3" to={isAuthenticated ? '/home' : '/'}>
          <span className="flex size-11 items-center justify-center rounded-[18px] border border-white/10 bg-[rgba(216,226,255,0.08)] font-display text-xl text-[color:var(--color-accent)]">
            W
          </span>
          <div>
            <div className="font-display text-[2rem] leading-none tracking-[-0.04em] text-white">
              WatchMate
            </div>
          </div>
        </NavLink>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'border-b-2 border-transparent px-4 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:text-white',
                  isActive ? 'border-[color:var(--color-accent)] text-white' : '',
                )
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && username ? (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'border-b-2 border-transparent px-4 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:text-white',
                  isActive ? 'border-[color:var(--color-accent)] text-white' : '',
                )
              }
              to="/profile"
            >
              Profile
            </NavLink>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated && username ? (
            <NavLink className={getButtonClassName('secondary', 'min-h-10 px-4 py-2')} to="/profile">
              {username}
            </NavLink>
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

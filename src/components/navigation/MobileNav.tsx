import {
  Bookmark,
  Clapperboard,
  Compass,
  LayoutDashboard,
  LogIn,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { cn } from '../../utils/cn'
import { privateMobileNavItems, publicMobileNavItems, type NavIcon } from './navItems'

const iconMap: Record<NavIcon, typeof Clapperboard> = {
  bookmark: Bookmark,
  clapperboard: Clapperboard,
  compass: Compass,
  'layout-dashboard': LayoutDashboard,
  'log-in': LogIn,
  search: Search,
  sparkles: Sparkles,
  user: UserRound,
}

export function MobileNav() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const username = useAuthStore((state) => state.username)
  const navItems = isAuthenticated && username ? privateMobileNavItems : publicMobileNavItems

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[28px] border border-white/10 bg-[rgba(24,26,31,0.88)] px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_20px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:hidden">
      <div className={cn('grid gap-1', navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5')}>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] text-[color:var(--color-text-tertiary)] transition',
                  isActive ? 'bg-[rgba(216,226,255,0.1)] text-[color:var(--color-accent)]' : 'hover:text-white',
                )
              }
              to={item.to}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

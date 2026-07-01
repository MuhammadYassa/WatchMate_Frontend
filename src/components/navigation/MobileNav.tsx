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
import { NavLink } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { cn } from '../../utils/cn'
import { privateMobileNavItems, publicMobileNavItems, type NavIcon } from './navItems'

const iconMap: Record<NavIcon, typeof Clapperboard> = {
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

export function MobileNav() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))
  const username = useAuthStore((state) => state.username)
  const navItems = isAuthenticated && username ? privateMobileNavItems : publicMobileNavItems

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[var(--radius-panel)] border border-white/10 bg-[rgba(17,16,14,0.92)] px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_18px_42px_rgba(0,0,0,0.42)] backdrop-blur-xl md:hidden">
      <div className={cn('grid gap-1', navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5')}>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[12px] px-2 py-2.5 text-[11px] text-[color:var(--color-text-tertiary)] transition duration-300',
                  isActive ? 'bg-[rgba(47,174,126,0.10)] text-[color:var(--color-accent)]' : 'hover:text-white',
                )
              }
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'motion-nav-indicator absolute inset-x-4 top-1 h-px rounded-full bg-[color:var(--color-accent)]',
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0',
                    )}
                  />
                  <Icon aria-hidden="true" className="size-4 transition duration-300 group-hover:scale-105" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

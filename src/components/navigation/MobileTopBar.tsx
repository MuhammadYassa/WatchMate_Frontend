import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuthStore } from '../../auth/authStore'
import { Logo } from '../branding/Logo'
import { getButtonClassName } from '../ui/buttonStyles'

export function MobileTopBar() {
  const username = useAuthStore((state) => state.username)
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken))

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(12,13,17,0.86)] px-4 py-3.5 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
        <Logo size="sm" to={isAuthenticated ? '/home' : '/'} />
        {isAuthenticated && username ? (
          <Link
            aria-label="Open your profile"
            className={getButtonClassName(
              'secondary',
              'max-w-[48vw] min-h-10 px-3 py-2 text-xs sm:max-w-none sm:px-4 sm:text-sm',
            )}
            to="/profile"
          >
            <UserRound aria-hidden="true" className="mr-1.5 size-4 shrink-0" />
            <span className="truncate">{username}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              className={getButtonClassName('ghost', 'min-h-10 px-3 py-2 text-xs sm:px-4 sm:text-sm')}
              to="/login"
            >
              Log in
            </Link>
            <Link
              className={getButtonClassName('primary', 'min-h-10 px-3 py-2 text-xs sm:px-4 sm:text-sm')}
              to="/register"
            >
              Join free
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

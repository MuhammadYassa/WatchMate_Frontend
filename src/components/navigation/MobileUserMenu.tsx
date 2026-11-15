import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useLogout } from '../../auth/useLogout'
import { cn } from '../../utils/cn'
import { Spinner } from '../feedback/Spinner'
import { getButtonClassName } from '../ui/buttonStyles'

export function MobileUserMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isLoggingOut, logout } = useLogout()

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${username}`}
        className={cn(
          getButtonClassName(
            'secondary',
            'max-w-[48vw] min-h-10 gap-1.5 px-3 py-2 text-xs sm:max-w-none sm:px-4 sm:text-sm',
          ),
          open && 'border-white/18 bg-[rgba(255,255,255,0.08)]',
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <UserRound aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate">{username}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-3.5 shrink-0 text-[color:var(--color-text-tertiary)] transition duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          className="wm-account-menu motion-scale-in absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 origin-top-right overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[color:var(--color-surface-glass-strong)] py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          role="menu"
        >
          <Link
            className="flex min-h-11 items-center gap-2.5 px-4 text-sm text-[color:var(--color-text-primary)] transition duration-200 hover:bg-white/[0.06]"
            onClick={() => setOpen(false)}
            role="menuitem"
            to="/profile"
          >
            <UserRound aria-hidden="true" className="size-4 shrink-0 text-[color:var(--color-text-tertiary)]" />
            View profile
          </Link>
          <button
            className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-sm text-[color:var(--color-text-primary)] transition duration-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={() => {
              setOpen(false)
              void logout()
            }}
            role="menuitem"
            type="button"
          >
            {isLoggingOut ? (
              <Spinner className="shrink-0 text-current" size="sm" />
            ) : (
              <LogOut aria-hidden="true" className="size-4 shrink-0 text-[color:var(--color-text-tertiary)]" />
            )}
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}

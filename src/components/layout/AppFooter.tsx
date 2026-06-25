import { Link } from 'react-router-dom'

import { cn } from '../../utils/cn'
import { useShellMode } from './useShellMode'

const footerLinks = [
  { label: 'Home', to: '/home' },
  { label: 'Discover', to: '/discover' },
  { label: 'Search', to: '/search' },
]

export function AppFooter() {
  const shellMode = useShellMode()

  if (shellMode !== 'topbar') {
    return null
  }

  return (
    <footer className="relative z-10 hidden border-t border-white/6 bg-[rgba(9,10,13,0.72)] backdrop-blur-xl md:block">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-6 xl:px-12">
        <div className="space-y-1">
          <p className="font-display text-[1.55rem] tracking-[-0.04em] text-[color:var(--color-text-secondary)]">
            WatchMate
          </p>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
            Nocturne cinema edition
          </p>
        </div>
        <nav className="flex items-center gap-5 text-sm text-[color:var(--color-text-tertiary)]">
          {footerLinks.map((item) => (
            <Link
              className={cn(
                'transition duration-300 hover:text-white',
                'after:block after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[color:var(--color-accent-strong)] after:transition-transform after:duration-300 hover:after:scale-x-100',
              )}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

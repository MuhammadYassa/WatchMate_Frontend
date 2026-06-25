import { Outlet, useLocation } from 'react-router-dom'

import { cn } from '../../utils/cn'
import { SessionExpiredModal } from '../feedback/SessionExpiredModal'
import { AppFooter } from './AppFooter'
import { ShellModeProvider } from './ShellModeContext'
import { getShellMode } from './shellMode'
import { DesktopNav } from '../navigation/DesktopNav'
import { MobileNav } from '../navigation/MobileNav'
import { MobileTopBar } from '../navigation/MobileTopBar'

export function AppShell() {
  const location = useLocation()
  const shellMode = getShellMode(location.pathname)

  return (
    <ShellModeProvider value={shellMode}>
      <div
        className="relative min-h-screen overflow-hidden bg-[color:var(--color-bg)] text-[color:var(--color-text-primary)]"
        data-shell-mode={shellMode}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.16),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(255,222,164,0.07),_transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_18%)]" />
        <div className="ambient-drift pointer-events-none absolute left-[-10rem] top-16 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(173,198,255,0.12)_0%,rgba(173,198,255,0)_72%)] blur-[110px]" />
        <div className="ambient-drift pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,_rgba(255,222,164,0.08)_0%,rgba(255,222,164,0)_70%)] blur-[120px] [animation-delay:-4s]" />
        <DesktopNav mode={shellMode} />
        <MobileTopBar />
        <main
          className={cn(
            'relative z-10 min-h-screen',
            shellMode === 'side-rail' ? 'md:pl-[calc(var(--shell-side-rail-width)+1.25rem)]' : '',
          )}
        >
          <Outlet />
        </main>
        <AppFooter />
        <MobileNav />
        <SessionExpiredModal />
      </div>
    </ShellModeProvider>
  )
}

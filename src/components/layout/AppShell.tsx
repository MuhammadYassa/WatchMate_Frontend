import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { cn } from '../../utils/cn'
import { SessionExpiredModal } from '../feedback/SessionExpiredModal'
import { Spinner } from '../feedback/Spinner'
import { AppFooter } from './AppFooter'
import { PresentationMotion } from './PresentationMotion'
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
        className="wm-shell relative min-h-dvh overflow-x-clip bg-[color:var(--color-bg)] text-[color:var(--color-text-primary)]"
        data-shell-mode={shellMode}
        data-page={location.pathname}
      >
        <DesktopNav mode={shellMode} />
        <MobileTopBar />
        <main
          className={cn(
            'wm-main relative z-10 min-h-dvh',
            shellMode === 'side-rail' ? 'md:pl-[calc(var(--shell-side-rail-width)+1.25rem)]' : '',
          )}
        >
          <Suspense
            fallback={
              <div className="flex min-h-dvh items-center justify-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <AppFooter />
        <PresentationMotion pathname={location.pathname} />
        <MobileNav />
        <SessionExpiredModal />
      </div>
    </ShellModeProvider>
  )
}

import { Outlet } from 'react-router-dom'

import { SessionExpiredModal } from '../feedback/SessionExpiredModal'
import { DesktopNav } from '../navigation/DesktopNav'
import { MobileNav } from '../navigation/MobileNav'
import { MobileTopBar } from '../navigation/MobileTopBar'

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--color-bg)] text-[color:var(--color-text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,222,164,0.06),_transparent_22%)]" />
      <DesktopNav />
      <MobileTopBar />
      <main className="relative z-10">
        <Outlet />
      </main>
      <MobileNav />
      <SessionExpiredModal />
    </div>
  )
}

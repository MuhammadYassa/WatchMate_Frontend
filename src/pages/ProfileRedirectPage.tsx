import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { ErrorState } from '../components/feedback/ErrorState'
import { PageContainer } from '../components/layout/PageContainer'
import { getButtonClassName } from '../components/ui/buttonStyles'

export function ProfileRedirectPage() {
  const username = useAuthStore((state) => state.username)
  const target = useMemo(() => {
    return username ? `/social/profile/${encodeURIComponent(username)}` : null
  }, [username])

  if (target) {
    return <Navigate replace to={target} />
  }

  return (
    <PageContainer className="relative isolate overflow-hidden pt-10">
      <BrowsePageAtmosphere />
      <div className="relative z-10">
        <ErrorState
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className={getButtonClassName('primary')} to="/login?returnTo=%2Fprofile">
                Sign in again
              </Link>
              <Link className={getButtonClassName('secondary')} to="/home">
                Back to home
              </Link>
            </div>
          }
          body="We couldn't restore your profile shortcut from the current session. Sign in again to refresh your account identity."
          heading="Your profile shortcut is unavailable"
        />
      </div>
    </PageContainer>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Search as SearchIcon, UserRoundSearch, Users } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { socialApi } from '../api/socialApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { MetadataPill } from '../components/media/MetadataPill'
import { UserInitialBadge } from '../components/social/UserInitialBadge'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import type { SearchListUserDetailsDTO } from '../types/api'
import { formatPrivacyStatus } from '../utils/labels'

function SocialSearchLoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 rounded-[var(--radius-panel)]" />
      <Skeleton className="h-28 rounded-[var(--radius-panel)]" />
      <Skeleton className="h-28 rounded-[var(--radius-panel)]" />
    </div>
  )
}

function getRelationshipLabel(result: SearchListUserDetailsDTO) {
  if (result.isSelf) {
    return 'You'
  }

  if (result.isFollowing) {
    return 'Following'
  }

  return 'Not following'
}

export function SocialSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryParam = searchParams.get('q') ?? ''
  const [draftQuery, setDraftQuery] = useState(queryParam)
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextValue = draftQuery.trim()
      setDebouncedQuery(nextValue)

      const nextParams = new URLSearchParams()
      if (nextValue) {
        nextParams.set('q', nextValue)
      }

      setSearchParams(nextParams, { replace: true })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [draftQuery, setSearchParams])

  const searchQuery = useQuery({
    enabled: debouncedQuery.length > 0,
    queryFn: () => socialApi.searchUsers(debouncedQuery),
    queryKey: ['social', 'search', debouncedQuery],
  })

  const results = useMemo(() => searchQuery.data ?? [], [searchQuery.data])

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] px-6 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.34)] md:px-8 md:py-9">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.10)_0%,rgba(47,174,126,0)_72%)]" />
        <div className="relative space-y-7">
          <div className="space-y-4">
            <h1 className="max-w-4xl font-display text-5xl tracking-[-0.03em] text-white md:text-6xl xl:text-[4.9rem]">
              Find people to follow.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
              Search by username to open a profile and keep your WatchMate circle close to the
              titles you care about.
            </p>
          </div>

          <FormField hint="Search by username." label="Find a WatchMate profile">
            <div className="relative max-w-3xl">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[color:var(--color-text-tertiary)]"
              />
              <Input
                className="h-16 rounded-[var(--radius-panel)] border-white/10 bg-[rgba(255,255,255,0.04)] pl-14 pr-24 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition duration-300 focus:border-[rgba(47,174,126,0.32)] focus:shadow-[0_0_0_1px_rgba(47,174,126,0.18),0_18px_55px_rgba(0,0,0,0.32)] md:h-18"
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Search usernames"
                value={draftQuery}
              />
              {draftQuery ? (
                <button
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[color:var(--color-text-tertiary)] transition hover:text-white"
                  onClick={() => setDraftQuery('')}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </FormField>
        </div>
      </section>

      {!debouncedQuery ? (
        <div className="relative z-10">
          <EmptyState
            body="Start with a username to browse profiles and see whether you are already connected."
            heading="Search by username"
            icon={<UserRoundSearch aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : null}

      {debouncedQuery && searchQuery.isLoading ? (
        <div className="relative z-10">
          <SocialSearchLoadingState />
        </div>
      ) : null}

      {debouncedQuery && searchQuery.isError ? (
        <div className="relative z-10">
          <ErrorState
            action={
              <Link
                className="inline-flex min-h-11 items-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:border-white/18 hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                to="/profile"
              >
                Back to profile
              </Link>
            }
            body="We couldn't search profiles right now."
            heading="Search is unavailable"
          />
        </div>
      ) : null}

      {debouncedQuery && !searchQuery.isLoading && !searchQuery.isError && results.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            body={`No profiles matched "${debouncedQuery}" right now. Try another username.`}
            heading="No matches yet"
            icon={<Users aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : null}

      {results.length > 0 ? (
        <section className="relative z-10 space-y-5">
          <SectionHeader eyebrow="Profiles" title={`Results for "${debouncedQuery}"`} />
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((result, index) => (
              <Link
                className="block focus-visible:outline-none"
                key={result.userId}
                to={`/social/profile/${encodeURIComponent(result.username)}`}
              >
                <Card
                  className="motion-slide-up group flex min-h-[118px] flex-col gap-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(22,20,18,0.9)_0%,rgba(12,11,9,0.98)_100%)] p-5 transition duration-300 hover:border-[rgba(47,174,126,0.16)] hover:shadow-[0_28px_68px_rgba(0,0,0,0.44)] sm:flex-row sm:items-center sm:justify-between"
                  style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
                >
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.06)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-center gap-4">
                    <UserInitialBadge size="sm" username={result.username} />
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-white">{result.username}</p>
                      <div className="flex flex-wrap gap-2">
                        <MetadataPill>{formatPrivacyStatus(result.privacyStatus)}</MetadataPill>
                        <MetadataPill>{getRelationshipLabel(result)}</MetadataPill>
                      </div>
                    </div>
                  </div>
                  <span className="relative inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-accent)]">
                    Open profile
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PageContainer>
  )
}

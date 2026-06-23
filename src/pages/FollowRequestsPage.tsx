import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Inbox, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { socialApi } from '../api/socialApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { UserInitialBadge } from '../components/social/UserInitialBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { FollowRequestDTO } from '../types/api'
import { ApiClientError } from '../types/errors'
import { formatDisplayDate } from '../utils/dates'

const PAGE_SIZE = 10

function FollowRequestsLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-60 rounded-[36px]" />
      <Skeleton className="relative z-10 h-36 rounded-[28px]" />
      <Skeleton className="relative z-10 h-36 rounded-[28px]" />
    </PageContainer>
  )
}

function getConflictMessage(error: unknown) {
  if (
    error instanceof ApiClientError
    && error.status === 409
    && error.code === 'FOLLOW_REQUEST_STATE_CONFLICT'
  ) {
    return 'This request was already handled.'
  }

  return null
}

export function FollowRequestsPage() {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const requestsQuery = useQuery({
    queryFn: () => socialApi.getReceivedFollowRequests(page, PAGE_SIZE),
    queryKey: ['social', 'follow-requests', 'received', page, PAGE_SIZE],
  })

  async function invalidateSocialState(request: FollowRequestDTO) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-requests'] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-status', request.requesterUserId] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'profile', request.requesterUsername] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'search'] }),
    ])
  }

  const acceptMutation = useMutation({
    mutationFn: async (request: FollowRequestDTO) => socialApi.acceptFollowRequest(request.requestId),
    onError: async (error) => {
      const conflictMessage = getConflictMessage(error)

      if (conflictMessage) {
        pushToast(conflictMessage, 'info')
        await requestsQuery.refetch()
        return
      }

      pushToast("We couldn't accept that request right now.", 'error')
    },
    onSuccess: async (_, request) => {
      pushToast(`${request.requesterUsername} can now see your shared profile.`, 'success')
      await invalidateSocialState(request)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (request: FollowRequestDTO) => socialApi.rejectFollowRequest(request.requestId),
    onError: async (error) => {
      const conflictMessage = getConflictMessage(error)

      if (conflictMessage) {
        pushToast(conflictMessage, 'info')
        await requestsQuery.refetch()
        return
      }

      pushToast("We couldn't decline that request right now.", 'error')
    },
    onSuccess: async (_, request) => {
      pushToast(`Request from ${request.requesterUsername} declined.`, 'success')
      await invalidateSocialState(request)
    },
  })

  if (requestsQuery.isLoading) {
    return <FollowRequestsLoadingState />
  }

  if (requestsQuery.isError || !requestsQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-8 md:pt-12">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => requestsQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            body="We couldn't load your pending requests right now."
            heading="Follow requests are unavailable"
          />
        </div>
      </PageContainer>
    )
  }

  const requestPage = requestsQuery.data
  const requests = requestPage.content

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <Card className="relative z-10 overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.97)_100%)] p-0 shadow-[0_30px_80px_rgba(0,0,0,0.36)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.15)_0%,rgba(173,198,255,0)_34%),linear-gradient(145deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative z-10 space-y-4 p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            Social
          </p>
          <h1 className="font-display text-5xl tracking-[-0.05em] text-white md:text-6xl">
            Follow requests
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
            Keep incoming requests tidy so the right people can see the watchlists and activity you share.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className={getButtonClassName('secondary')} to="/social/search">
              Find people
            </Link>
            <Link className={getButtonClassName('ghost')} to="/profile">
              Back to profile
            </Link>
          </div>
        </div>
      </Card>

      {requests.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            action={
              <Link className={getButtonClassName('secondary')} to="/social/search">
                Find people
              </Link>
            }
            body="No one is waiting on a response right now. New requests will show up here when someone asks to follow your profile."
            heading="No pending requests"
            icon={<Inbox aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : (
        <section className="relative z-10 space-y-5">
          <SectionHeader
            action={
              <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
                {requestPage.totalElements} pending
              </div>
            }
            eyebrow="Awaiting your reply"
            title="Incoming requests"
          />
          <div className="space-y-4">
            {requests.map((request) => {
              const actionPending =
                (acceptMutation.isPending && acceptMutation.variables?.requestId === request.requestId)
                || (rejectMutation.isPending && rejectMutation.variables?.requestId === request.requestId)

              return (
                <Card
                  className="flex flex-col gap-4 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-5 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.3)] md:flex-row md:items-center md:justify-between"
                  key={request.requestId}
                >
                  <div className="flex items-center gap-4">
                    <UserInitialBadge size="sm" username={request.requesterUsername} />
                    <div className="space-y-1.5">
                      <Link
                        className="text-lg font-semibold text-white transition hover:text-[color:var(--color-accent)]"
                        to={`/social/profile/${encodeURIComponent(request.requesterUsername)}`}
                      >
                        {request.requesterUsername}
                      </Link>
                      <p className="text-sm text-[color:var(--color-text-tertiary)]">
                        Requested on {formatDisplayDate(request.requestedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={actionPending}
                      onClick={() => acceptMutation.mutate(request)}
                      variant="secondary"
                    >
                      <Check aria-hidden="true" className="mr-2 size-4" />
                      Accept
                    </Button>
                    <Button
                      disabled={actionPending}
                      onClick={() => rejectMutation.mutate(request)}
                      variant="ghost"
                    >
                      <X aria-hidden="true" className="mr-2 size-4" />
                      Decline
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {requestPage.totalPages > 1 ? (
            <Card className="flex items-center justify-between gap-4 border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-4">
              <Button disabled={requestPage.first} onClick={() => setPage((current) => current - 1)} variant="ghost">
                Previous
              </Button>
              <p className="text-sm text-[color:var(--color-text-tertiary)]">
                Page {requestPage.number + 1} of {requestPage.totalPages}
              </p>
              <Button disabled={requestPage.last} onClick={() => setPage((current) => current + 1)} variant="ghost">
                Next
              </Button>
            </Card>
          ) : null}
        </section>
      )}
    </PageContainer>
  )
}

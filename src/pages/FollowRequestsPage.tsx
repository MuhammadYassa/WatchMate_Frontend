import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Inbox, Send, X } from 'lucide-react'
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

const PAGE_SIZE = 20
type RequestTab = 'received' | 'sent'

function FollowRequestsLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-60 rounded-[var(--radius-panel)]" />
      <Skeleton className="relative z-10 h-28 rounded-[var(--radius-panel)]" />
      <Skeleton className="relative z-10 h-28 rounded-[var(--radius-panel)]" />
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
  const [activeTab, setActiveTab] = useState<RequestTab>('received')
  const [receivedPage, setReceivedPage] = useState(0)
  const [sentPage, setSentPage] = useState(0)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const receivedRequestsQuery = useQuery({
    queryFn: () => socialApi.getReceivedFollowRequests(receivedPage, PAGE_SIZE),
    queryKey: ['social', 'follow-requests', 'received', receivedPage, PAGE_SIZE],
  })

  const sentRequestsQuery = useQuery({
    queryFn: () => socialApi.getSentFollowRequests(sentPage, PAGE_SIZE),
    queryKey: ['social', 'follow-requests', 'sent', sentPage, PAGE_SIZE],
  })

  async function invalidateSocialState(request: FollowRequestDTO) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-requests'] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-status', request.requesterUserId] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-status', request.targetUserId] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'profile', request.requesterUsername] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'profile', request.targetUsername] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'search'] }),
    ])
  }

  const acceptMutation = useMutation({
    mutationFn: async (request: FollowRequestDTO) => socialApi.acceptFollowRequest(request.requestId),
    onError: async (error) => {
      const conflictMessage = getConflictMessage(error)

      if (conflictMessage) {
        pushToast(conflictMessage, 'info')
        await receivedRequestsQuery.refetch()
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
        await receivedRequestsQuery.refetch()
        return
      }

      pushToast("We couldn't decline that request right now.", 'error')
    },
    onSuccess: async (_, request) => {
      pushToast(`Request from ${request.requesterUsername} declined.`, 'success')
      await invalidateSocialState(request)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (request: FollowRequestDTO) => socialApi.cancelFollowRequest(request.requestId),
    onError: async (error) => {
      const conflictMessage = getConflictMessage(error)

      if (conflictMessage) {
        pushToast(conflictMessage, 'info')
        await sentRequestsQuery.refetch()
        return
      }

      pushToast("We couldn't cancel that request right now.", 'error')
    },
    onSuccess: async (_, request) => {
      pushToast(`Canceled request to ${request.targetUsername}.`, 'success')
      await invalidateSocialState(request)
    },
  })

  if (receivedRequestsQuery.isLoading || sentRequestsQuery.isLoading) {
    return <FollowRequestsLoadingState />
  }

  if (
    receivedRequestsQuery.isError
    || sentRequestsQuery.isError
    || !receivedRequestsQuery.data
    || !sentRequestsQuery.data
  ) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-8 md:pt-12">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button
                onClick={() => {
                  void receivedRequestsQuery.refetch()
                  void sentRequestsQuery.refetch()
                }}
                variant="secondary"
              >
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

  const requestPage = activeTab === 'received' ? receivedRequestsQuery.data : sentRequestsQuery.data
  const requests = requestPage.content

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] px-6 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.36)] md:px-8 md:py-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,174,126,0.15)_0%,rgba(47,174,126,0)_34%),linear-gradient(145deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative z-10 space-y-4">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            Social
          </p>
          <h1 className="font-display text-5xl tracking-[-0.03em] text-white md:text-6xl xl:text-[4.75rem]">
            Follow requests
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
            Keep incoming requests tidy so the right people can see the watchlists and activity
            you share.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className={getButtonClassName('secondary')} to="/social/search">
              Find people
            </Link>
            <Link className={getButtonClassName('ghost')} to="/profile">
              Back to profile
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              aria-pressed={activeTab === 'received'}
              onClick={() => setActiveTab('received')}
              variant={activeTab === 'received' ? 'secondary' : 'ghost'}
            >
              Received
            </Button>
            <Button
              aria-pressed={activeTab === 'sent'}
              onClick={() => setActiveTab('sent')}
              variant={activeTab === 'sent' ? 'secondary' : 'ghost'}
            >
              Sent
            </Button>
          </div>
        </div>
      </section>

      {requests.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            action={
              <Link className={getButtonClassName('secondary')} to="/social/search">
                Find people
              </Link>
            }
            body={
              activeTab === 'received'
                ? 'No one is waiting on a response right now. New requests will show up here when someone asks to follow your profile.'
                : 'You have not sent any pending follow requests right now.'
            }
            heading={activeTab === 'received' ? 'No pending requests' : 'No sent requests'}
            icon={activeTab === 'received' ? <Inbox aria-hidden="true" className="size-5" /> : <Send aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : (
        <section className="relative z-10 space-y-5">
          <SectionHeader
            action={
              <div className="rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
                {requestPage.totalElements} pending
              </div>
            }
            eyebrow={activeTab === 'received' ? 'Awaiting your reply' : 'Awaiting their reply'}
            title={activeTab === 'received' ? 'Incoming requests' : 'Sent requests'}
          />
          <div className="space-y-4">
            {requests.map((request, index) => {
              const acceptPending =
                acceptMutation.isPending && acceptMutation.variables?.requestId === request.requestId
              const rejectPending =
                rejectMutation.isPending && rejectMutation.variables?.requestId === request.requestId
              const cancelPending =
                cancelMutation.isPending && cancelMutation.variables?.requestId === request.requestId
              const actionPending = acceptPending || rejectPending || cancelPending

              return (
                <Card
                  className="motion-slide-up flex flex-col gap-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-5 transition duration-300 hover:border-[rgba(47,174,126,0.18)] hover:shadow-[0_28px_68px_rgba(0,0,0,0.38)] md:flex-row md:items-center md:justify-between"
                  key={request.requestId}
                  style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
                >
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(47,174,126,0.08)_0%,rgba(47,174,126,0)_72%)] opacity-0 transition duration-300 hover:opacity-100" />
                  <div className="relative flex items-center gap-4">
                    <UserInitialBadge
                      size="sm"
                      username={activeTab === 'received' ? request.requesterUsername : request.targetUsername}
                    />
                    <div className="space-y-1.5">
                      <Link
                        className="text-lg font-semibold text-white transition hover:text-[color:var(--color-accent)]"
                        to={`/social/profile/${encodeURIComponent(activeTab === 'received' ? request.requesterUsername : request.targetUsername)}`}
                      >
                        {activeTab === 'received' ? request.requesterUsername : request.targetUsername}
                      </Link>
                      <p className="text-sm text-[color:var(--color-text-tertiary)]">
                        {activeTab === 'received' ? 'Requested on ' : 'Sent on '}
                        {formatDisplayDate(request.requestedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex flex-wrap gap-3">
                    {activeTab === 'received' ? (
                      <>
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
                      </>
                    ) : (
                      <Button
                        disabled={actionPending}
                        onClick={() => cancelMutation.mutate(request)}
                        variant="ghost"
                      >
                        <X aria-hidden="true" className="mr-2 size-4" />
                        Cancel request
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {requestPage.totalPages > 1 ? (
            <Card className="flex items-center justify-between gap-4 overflow-hidden border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-4">
              <Button
                disabled={Boolean(requestPage.first)}
                onClick={() => {
                  if (activeTab === 'received') {
                    setReceivedPage((current) => current - 1)
                    return
                  }

                  setSentPage((current) => current - 1)
                }}
                variant="ghost"
              >
                Previous
              </Button>
              <p className="text-sm text-[color:var(--color-text-tertiary)]">
                Page {requestPage.number + 1} of {requestPage.totalPages}
              </p>
              <Button
                disabled={Boolean(requestPage.last)}
                onClick={() => {
                  if (activeTab === 'received') {
                    setReceivedPage((current) => current + 1)
                    return
                  }

                  setSentPage((current) => current + 1)
                }}
                variant="ghost"
              >
                Next
              </Button>
            </Card>
          ) : null}
        </section>
      )}
    </PageContainer>
  )
}

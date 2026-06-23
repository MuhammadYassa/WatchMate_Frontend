import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  Film,
  Lock,
  MessageSquare,
  Rows3,
  Search,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { socialApi } from '../api/socialApi'
import { useAuthStore } from '../auth/authStore'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster, SkeletonText } from '../components/feedback/Skeleton'
import { useToast } from '../components/feedback/toastContext'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { MediaGrid } from '../components/media/MediaGrid'
import { MetadataPill } from '../components/media/MetadataPill'
import { PosterCard } from '../components/media/PosterCard'
import { PosterPlaceholder } from '../components/media/PosterPlaceholder'
import { ReviewCard } from '../components/media/ReviewCard'
import { UserInitialBadge } from '../components/social/UserInitialBadge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { SearchItemDTO, UserProfileDTO, WatchListDTO } from '../types/api'
import type { FollowStatuses } from '../types/enums'
import { formatPrivacyStatus, formatFollowStatus } from '../utils/labels'
import { getSearchResultRoute } from '../utils/mediaRoutes'
import { getPosterUrl, hasImagePath } from '../utils/tmdbImages'

function normalizeUsername(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function ProfileLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Card className="relative z-10 overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.97)_100%)] p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <Skeleton className="size-24 rounded-[30px]" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-32 rounded-[14px]" />
              <Skeleton className="h-12 w-56 rounded-[18px]" />
              <Skeleton className="h-5 w-40 rounded-[14px]" />
            </div>
          </div>
          <Skeleton className="h-12 w-48 rounded-2xl" />
        </div>
        <SkeletonText />
      </Card>
      <div className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
      <div className="relative z-10 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-[28px]" />
        <Skeleton className="h-64 rounded-[28px]" />
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SkeletonPoster />
        <SkeletonPoster />
        <SkeletonPoster />
        <SkeletonPoster />
      </div>
    </PageContainer>
  )
}

function ProfileStatCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <Card className="space-y-2.5 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">{label}</p>
      <p className="font-display text-3xl tracking-[-0.04em] text-white">{value}</p>
    </Card>
  )
}

function ProfileWatchlistPreview({ watchlist }: { watchlist: WatchListDTO }) {
  const previewItems = watchlist.media.slice(0, 3)

  return (
    <Card className="space-y-4 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-4">
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-white">{watchlist.name}</p>
        <p className="text-xs text-[color:var(--color-text-tertiary)]">
          {watchlist.media.length} saved {watchlist.media.length === 1 ? 'title' : 'titles'}
        </p>
      </div>

      {previewItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {previewItems.map((item) =>
            hasImagePath(item.posterPath) ? (
              <img
                key={`${watchlist.id}-${item.type}-${item.tmdbId}`}
                alt=""
                className="aspect-[2/3] w-full rounded-[18px] border border-white/10 object-cover shadow-[0_16px_35px_rgba(0,0,0,0.28)]"
                src={getPosterUrl(item.posterPath, 'w342') ?? undefined}
              />
            ) : (
              <PosterPlaceholder
                key={`${watchlist.id}-${item.type}-${item.tmdbId}`}
                className="min-h-[144px]"
                title={item.title}
              />
            ),
          )}
        </div>
      ) : (
        <div className="grid min-h-[144px] place-items-center rounded-[20px] border border-dashed border-white/10 bg-[rgba(255,255,255,0.03)]">
          <PosterPlaceholder className="max-w-[120px]" title={watchlist.name} />
        </div>
      )}
    </Card>
  )
}

function WatchedMediaSection({
  emptyBody,
  heading,
  items,
}: {
  emptyBody: string
  heading: string
  items: SearchItemDTO[]
}) {
  return (
    <section className="space-y-5">
      <SectionHeader eyebrow="Watched" title={heading} />
      {items.length > 0 ? (
        <MediaGrid>
          {items.map((item) => (
            <PosterCard
              key={`${item.mediaType}-${item.id}`}
              href={getSearchResultRoute(item.id, item.mediaType)}
              imagePath={item.posterPath}
              mediaTypeLabel={item.mediaType === 'movie' ? 'Movie' : 'Show'}
              rating={item.voteAverage}
              releaseDate={item.releaseDate}
              title={item.title}
            />
          ))}
        </MediaGrid>
      ) : (
        <EmptyState
          body={emptyBody}
          heading="Nothing here yet"
          icon={<Film aria-hidden="true" className="size-5" />}
        />
      )}
    </section>
  )
}

export function ProfilePage() {
  const { username } = useParams()
  const storedUsername = useAuthStore((state) => state.username)
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const profileQuery = useQuery({
    enabled: Boolean(username),
    queryFn: () => socialApi.getProfile(username ?? ''),
    queryKey: ['social', 'profile', username],
  })

  const profileData = profileQuery.data ?? null
  const isSelf = useMemo(() => {
    if (!profileData) {
      return false
    }

    return normalizeUsername(profileData.username) === normalizeUsername(storedUsername)
  }, [profileData, storedUsername])

  const followStatusQuery = useQuery({
    enabled: Boolean(profileData) && !isSelf,
    queryFn: () => socialApi.getFollowStatus(profileData!.userId),
    queryKey: ['social', 'follow-status', profileData?.userId],
  })

  const effectiveFollowStatus: FollowStatuses | null =
    followStatusQuery.data?.followStatus ?? profileData?.followStatus ?? null

  async function invalidateSocialState(profileData: UserProfileDTO) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['social', 'profile', username] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-status', profileData.userId] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'search'] }),
    ])
  }

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error('Profile is unavailable.')
      }

      return socialApi.followUser(profile.userId)
    },
    onSuccess: async (result) => {
      if (!profile) {
        return
      }

      pushToast(
        result.followStatus === 'REQUESTED'
          ? 'Follow request sent.'
          : 'You are now following this profile.',
        'success',
      )
      await invalidateSocialState(profile)
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error('Profile is unavailable.')
      }

      return socialApi.unfollowUser(profile.userId)
    },
    onSuccess: async () => {
      if (!profile) {
        return
      }

      pushToast('Unfollowed profile.', 'success')
      await invalidateSocialState(profile)
    },
  })

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error('Profile is unavailable.')
      }

      return socialApi.toggleBlockUser(profile.userId)
    },
    onSuccess: async (result) => {
      if (!profile) {
        return
      }

      pushToast(
        result.followStatus === 'BLOCKED' ? 'Profile blocked.' : 'Block status updated.',
        'success',
      )
      await invalidateSocialState(profile)
    },
  })

  if (!username) {
    return (
      <PageContainer className="pt-10">
        <ErrorState body="This profile link is missing a username." heading="Profile unavailable" />
      </PageContainer>
    )
  }

  if (profileQuery.isLoading) {
    return <ProfileLoadingState />
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageContainer className="relative isolate overflow-hidden pt-10">
        <BrowsePageAtmosphere />
        <div className="relative z-10">
          <ErrorState
            action={
              <Button onClick={() => profileQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            body="We couldn't load this profile right now."
            heading="Profile unavailable"
          />
        </div>
      </PageContainer>
    )
  }

  const profile = profileData!

  const hasWatchlistsSection = profile.watchlists !== undefined
  const hasReviewsSection = profile.reviews !== undefined
  const hasMoviesWatchedSection = profile.moviesWatched !== undefined
  const hasShowsWatchedSection = profile.showsWatched !== undefined
  const hasVisibleSections =
    hasWatchlistsSection || hasReviewsSection || hasMoviesWatchedSection || hasShowsWatchedSection
  const isBlockedProfile = effectiveFollowStatus === 'BLOCKED'
  const isPrivateInaccessible =
    !isSelf
    && profile.privacyStatus === 'PRIVATE'
    && effectiveFollowStatus !== 'FOLLOWING'
    && effectiveFollowStatus !== 'BLOCKED'
  const actionPending =
    followMutation.isPending || unfollowMutation.isPending || blockMutation.isPending

  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:space-y-10 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <Card className="relative z-10 overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.97)_100%)] p-0 shadow-[0_30px_80px_rgba(0,0,0,0.36)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.18)_0%,rgba(173,198,255,0)_34%),linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative z-10 flex flex-col gap-8 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <UserInitialBadge size="lg" username={profile.username} />
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  {isSelf ? 'Your profile' : 'Profile'}
                </p>
                <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.05em] text-white md:text-6xl">
                  {profile.username}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <MetadataPill>{formatPrivacyStatus(profile.privacyStatus)}</MetadataPill>
                  {!isSelf && effectiveFollowStatus ? (
                    <MetadataPill>{formatFollowStatus(effectiveFollowStatus)}</MetadataPill>
                  ) : null}
                </div>
              </div>
            </div>

            {!isSelf ? (
              <div className="flex flex-wrap gap-3">
                {effectiveFollowStatus === 'FOLLOWING' ? (
                  <Button disabled={actionPending} onClick={() => unfollowMutation.mutate()} variant="secondary">
                    <UserMinus aria-hidden="true" className="mr-2 size-4" />
                    Following
                  </Button>
                ) : effectiveFollowStatus === 'REQUESTED' ? (
                  <Button disabled variant="secondary">
                    <UserCheck aria-hidden="true" className="mr-2 size-4" />
                    Requested
                  </Button>
                ) : effectiveFollowStatus === 'NOT_FOLLOWING' ? (
                  <Button disabled={actionPending} onClick={() => followMutation.mutate()}>
                    <UserPlus aria-hidden="true" className="mr-2 size-4" />
                    Follow
                  </Button>
                ) : null}

                {!isBlockedProfile ? (
                  <Button disabled={actionPending} onClick={() => blockMutation.mutate()} variant="ghost">
                    <Ban aria-hidden="true" className="mr-2 size-4" />
                    Block profile
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
            {isSelf
              ? 'This is your public-facing WatchMate profile preview, with shared watchlists and activity when available.'
              : isBlockedProfile
                ? 'This connection is blocked, so shared profile details are not available right now.'
                : isPrivateInaccessible
                  ? effectiveFollowStatus === 'REQUESTED'
                    ? 'Your follow request is pending. Shared watchlists and activity will appear here after it is accepted.'
                    : 'This profile is private. Follow to see any shared watchlists and activity they make available.'
                  : 'Shared watchlists and recent activity appear here when this profile makes them visible to you.'}
          </p>
        </div>
      </Card>

      <section className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileStatCard label="Followers" value={profile.followersCount} />
        <ProfileStatCard label="Following" value={profile.followingCount} />
        {profile.moviesWatchedCount !== undefined ? (
          <ProfileStatCard label="Movies watched" value={profile.moviesWatchedCount} />
        ) : null}
        {profile.showsWatchedCount !== undefined ? (
          <ProfileStatCard label="Shows watched" value={profile.showsWatchedCount} />
        ) : null}
      </section>

      {isSelf ? (
        <Card className="relative z-10 flex flex-col gap-5 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Social tools
            </p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-white">Keep your circle close.</h2>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Find more people to follow or review any pending follow requests from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={getButtonClassName('secondary')} to="/social/search">
              <Search aria-hidden="true" className="mr-2 size-4" />
              Find people
            </Link>
            <Link className={getButtonClassName('ghost')} to="/follow-requests">
              <UserCheck aria-hidden="true" className="mr-2 size-4" />
              Follow requests
            </Link>
          </div>
        </Card>
      ) : null}

      {isBlockedProfile ? (
        <div className="relative z-10">
          <EmptyState
            body="Shared watchlists and profile activity stay hidden while this connection is blocked."
            heading="This profile is blocked"
            icon={<ShieldAlert aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : null}

      {isPrivateInaccessible ? (
        <div className="relative z-10">
          <EmptyState
            body={
              effectiveFollowStatus === 'REQUESTED'
                ? 'Your request is pending. Shared watchlists and profile activity will appear here after approval.'
                : 'Follow this private profile to see any watchlists or activity they choose to share.'
            }
            heading={effectiveFollowStatus === 'REQUESTED' ? 'Request pending' : 'Private profile'}
            icon={<Lock aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : null}

      {!isBlockedProfile && !isPrivateInaccessible && !hasVisibleSections ? (
        <div className="relative z-10">
          <EmptyState
            body="This profile does not have any shared watchlists or activity previews to show right now."
            heading="Nothing shared yet"
            icon={<Users aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : null}

      {!isBlockedProfile && !isPrivateInaccessible && hasWatchlistsSection ? (
        <section className="relative z-10 space-y-5">
          <SectionHeader eyebrow="Shared now" title={isSelf ? 'Your watchlists' : 'Watchlists'} />
          {profile.watchlists!.content.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {profile.watchlists!.content.map((watchlist) => (
                <ProfileWatchlistPreview key={watchlist.id} watchlist={watchlist} />
              ))}
            </div>
          ) : (
            <EmptyState
              body={isSelf ? 'You have not created any watchlists yet.' : 'No watchlists are shared on this profile yet.'}
              heading="No watchlists yet"
              icon={<Rows3 aria-hidden="true" className="size-5" />}
            />
          )}
        </section>
      ) : null}

      {!isBlockedProfile && !isPrivateInaccessible && hasReviewsSection ? (
        <section className="relative z-10 space-y-5">
          <SectionHeader eyebrow="Reviews" title={isSelf ? 'Your reviews' : 'Recent reviews'} />
          {profile.reviews!.content.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {profile.reviews!.content.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState
              body={isSelf ? 'Your reviews will show up here once you start posting them.' : 'No reviews are visible on this profile yet.'}
              heading="No reviews yet"
              icon={<MessageSquare aria-hidden="true" className="size-5" />}
            />
          )}
        </section>
      ) : null}

      {!isBlockedProfile && !isPrivateInaccessible && hasMoviesWatchedSection ? (
        <div className="relative z-10">
          <WatchedMediaSection
            emptyBody={isSelf ? 'Watched movies will show up here as you keep tracking titles.' : 'No watched movie preview is visible on this profile yet.'}
            heading={isSelf ? 'Movies you watched' : 'Movies watched'}
            items={profile.moviesWatched!.content}
          />
        </div>
      ) : null}

      {!isBlockedProfile && !isPrivateInaccessible && hasShowsWatchedSection ? (
        <div className="relative z-10">
          <WatchedMediaSection
            emptyBody={isSelf ? 'Watched shows will show up here as you keep tracking titles.' : 'No watched show preview is visible on this profile yet.'}
            heading={isSelf ? 'Shows you watched' : 'Shows watched'}
            items={profile.showsWatched!.content}
          />
        </div>
      ) : null}
    </PageContainer>
  )
}

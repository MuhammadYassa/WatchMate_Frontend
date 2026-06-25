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
import { Select } from '../components/ui/Select'
import { getButtonClassName } from '../components/ui/buttonStyles'
import type { SearchItemDTO, UserProfileDTO, WatchListDTO } from '../types/api'
import type { FollowStatus, PrivacyStatus } from '../types/enums'
import { formatPrivacyStatus, formatFollowStatus } from '../utils/labels'
import { getSearchResultRoute } from '../utils/mediaRoutes'
import { getPosterUrl, hasImagePath } from '../utils/tmdbImages'

function normalizeUsername(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function ProfileLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:pt-10">
      <BrowsePageAtmosphere variant="hero" />
      <Card className="relative z-10 overflow-hidden p-0">
        <Skeleton className="h-48 rounded-none" />
        <div className="grid gap-6 px-6 pb-6 pt-0 md:px-8 md:pb-8 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <Skeleton className="-mt-10 size-28 rounded-[34px] md:size-36" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 rounded-[14px]" />
            <Skeleton className="h-12 w-56 rounded-[18px]" />
            <Skeleton className="h-5 w-40 rounded-[14px]" />
          </div>
          <Skeleton className="h-12 w-48 rounded-[14px]" />
        </div>
      </Card>
      <div className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-[18px]" />
        <Skeleton className="h-28 rounded-[18px]" />
        <Skeleton className="h-28 rounded-[18px]" />
        <Skeleton className="h-28 rounded-[18px]" />
      </div>
      <div className="relative z-10 grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <Skeleton className="h-72 rounded-[18px]" />
        <div className="grid gap-6">
          <Skeleton className="h-64 rounded-[18px]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SkeletonPoster />
            <SkeletonPoster />
            <SkeletonPoster />
            <SkeletonPoster />
          </div>
        </div>
      </div>
      <SkeletonText />
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
    <Card className="space-y-2 border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">{label}</p>
      <p className="font-display text-[2.3rem] leading-none tracking-[-0.04em] text-white">{value}</p>
    </Card>
  )
}

function ProfileWatchlistPreview({ watchlist }: { watchlist: WatchListDTO }) {
  const previewItems = watchlist.media.slice(0, 3)
  const heroItem = previewItems[0]

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative min-h-[18rem]">
        {heroItem && hasImagePath(heroItem.posterPath) ? (
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            src={getPosterUrl(heroItem.posterPath, 'w500') ?? undefined}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(10,11,14,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.14),transparent_28%)]" />

        <div className="relative z-10 flex h-full min-h-[18rem] flex-col justify-end p-5">
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
              Watchlist
            </p>
            <h3 className="font-display text-[2rem] tracking-[-0.04em] text-white">{watchlist.name}</h3>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              {watchlist.media.length} saved {watchlist.media.length === 1 ? 'title' : 'titles'}
            </p>
          </div>

          {previewItems.length > 0 ? (
            <div className="mt-5 flex gap-3">
              {previewItems.map((item) =>
                hasImagePath(item.posterPath) ? (
                  <img
                    key={`${watchlist.id}-${item.type}-${item.tmdbId}`}
                    alt=""
                    className="aspect-[2/3] w-20 rounded-[12px] border border-white/10 object-cover shadow-[0_16px_35px_rgba(0,0,0,0.28)]"
                    src={getPosterUrl(item.posterPath, 'w342') ?? undefined}
                  />
                ) : (
                  <PosterPlaceholder
                    key={`${watchlist.id}-${item.type}-${item.tmdbId}`}
                    className="w-20"
                    title={item.title}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="mt-5 max-w-[8rem]">
              <PosterPlaceholder title={watchlist.name} />
            </div>
          )}
        </div>
      </div>
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
    queryFn: () => socialApi.getProfileByUsername(username ?? ''),
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

  const effectiveFollowStatus: FollowStatus | null =
    followStatusQuery.data?.followStatus ?? profileData?.followStatus ?? null

  async function invalidateSocialState(profileData: UserProfileDTO) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['social', 'profile', username] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-status', profileData.userId] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'search'] }),
      queryClient.invalidateQueries({ queryKey: ['social', 'follow-requests'] }),
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

      return socialApi.blockUser(profile.userId)
    },
    onSuccess: async () => {
      if (!profile) {
        return
      }

      pushToast('Profile blocked.', 'success')
      await invalidateSocialState(profile)
    },
  })

  const unblockMutation = useMutation({
    mutationFn: async () => {
      if (!profile) {
        throw new Error('Profile is unavailable.')
      }

      return socialApi.unblockUser(profile.userId)
    },
    onSuccess: async () => {
      if (!profile) {
        return
      }

      pushToast('Profile unblocked.', 'success')
      await invalidateSocialState(profile)
    },
  })

  const privacyMutation = useMutation({
    mutationFn: async (privacyStatus: PrivacyStatus) => socialApi.updateMyPrivacyStatus(privacyStatus),
    onError: () => {
      pushToast("We couldn't update your profile visibility right now.", 'error')
    },
    onSuccess: async (_, privacyStatus) => {
      if (!profile) {
        return
      }

      pushToast(
        privacyStatus === 'PRIVATE' ? 'Profile visibility set to private.' : 'Profile visibility set to public.',
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
    && effectiveFollowStatus !== 'SELF'
  const hasPendingFollowRequest = effectiveFollowStatus === 'REQUESTED'
  const actionPending =
    followMutation.isPending
    || unfollowMutation.isPending
    || blockMutation.isPending
    || unblockMutation.isPending
    || privacyMutation.isPending

  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:space-y-12 md:pt-10">
      <BrowsePageAtmosphere variant="hero" />

      <Card className="relative z-10 overflow-hidden p-0 shadow-[0_34px_90px_rgba(0,0,0,0.38)]">
        <div className="relative h-44 md:h-56">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(173,198,255,0.18)_0%,rgba(18,23,31,0.22)_42%,rgba(9,10,13,0.86)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.2),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(255,222,164,0.08),transparent_18%)]" />
          <div className="absolute inset-y-0 right-[8%] hidden w-[26rem] rotate-[-6deg] rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] lg:block" />
        </div>

        <div className="relative z-10 grid gap-6 px-6 pb-6 pt-0 md:px-8 md:pb-8 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <div className="-mt-10 md:-mt-16">
            <UserInitialBadge size="xl" username={profile.username} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                {isSelf ? 'Your profile' : 'Profile'}
              </p>
              <h1 className="font-display text-[3.1rem] leading-[0.94] tracking-[-0.055em] text-white md:text-[4.3rem]">
                {profile.username}
              </h1>
              <div className="flex flex-wrap gap-2">
                <MetadataPill>{formatPrivacyStatus(profile.privacyStatus)}</MetadataPill>
                {!isSelf && effectiveFollowStatus ? (
                  <MetadataPill>{formatFollowStatus(effectiveFollowStatus)}</MetadataPill>
                ) : null}
              </div>
            </div>

            <p className="max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)]">
              {isSelf
                ? 'This is your public-facing WatchMate profile preview, with shared watchlists and activity when available.'
                : isBlockedProfile
                    ? 'This connection is blocked, so shared profile details are not available right now.'
                    : isPrivateInaccessible
                    ? hasPendingFollowRequest
                      ? 'Your follow request is pending. Shared watchlists and activity will appear here after it is accepted.'
                      : 'This profile is private. Follow to see any shared watchlists and activity they make available.'
                    : 'Shared watchlists and recent activity appear here when this profile makes them visible to you.'}
            </p>
          </div>

          {!isSelf ? (
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {effectiveFollowStatus === 'FOLLOWING' ? (
                <Button disabled={actionPending} onClick={() => unfollowMutation.mutate()} variant="secondary">
                  <UserMinus aria-hidden="true" className="mr-2 size-4" />
                  Following
                </Button>
              ) : hasPendingFollowRequest ? (
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
              ) : (
                <Button disabled={actionPending} onClick={() => unblockMutation.mutate()} variant="ghost">
                  <Ban aria-hidden="true" className="mr-2 size-4" />
                  Unblock profile
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="relative z-10 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <ProfileStatCard label="Followers" value={profile.followersCount} />
            <ProfileStatCard label="Following" value={profile.followingCount} />
            {profile.moviesWatchedCount !== undefined ? (
              <ProfileStatCard label="Movies watched" value={profile.moviesWatchedCount} />
            ) : null}
            {profile.showsWatchedCount !== undefined ? (
              <ProfileStatCard label="Shows watched" value={profile.showsWatchedCount} />
            ) : null}
          </div>

          {isSelf ? (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                    Social tools
                  </p>
                  <h2 className="font-display text-[2.1rem] tracking-[-0.04em] text-white">
                    Keep your circle close.
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    Find more people to follow or review any pending follow requests from one place.
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]"
                    htmlFor="profile-visibility"
                  >
                    Profile visibility
                  </label>
                  <Select
                    className="max-w-xs"
                    disabled={privacyMutation.isPending}
                    id="profile-visibility"
                    onChange={(event) => {
                      const nextPrivacyStatus = event.target.value as PrivacyStatus

                      if (nextPrivacyStatus !== profile.privacyStatus) {
                        privacyMutation.mutate(nextPrivacyStatus)
                      }
                    }}
                    value={profile.privacyStatus}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </Select>
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
              </div>
            </Card>
          ) : null}

          {isBlockedProfile ? (
            <EmptyState
              body="Shared watchlists and profile activity stay hidden while this connection is blocked."
              heading="This profile is blocked"
              icon={<ShieldAlert aria-hidden="true" className="size-5" />}
            />
          ) : null}

          {isPrivateInaccessible ? (
            <EmptyState
              body={
                hasPendingFollowRequest
                  ? 'Your request is pending. Shared watchlists and profile activity will appear here after approval.'
                  : 'Follow this private profile to see any watchlists or activity they choose to share.'
              }
              heading={hasPendingFollowRequest ? 'Request pending' : 'Private profile'}
              icon={<Lock aria-hidden="true" className="size-5" />}
            />
          ) : null}

          {!isBlockedProfile && !isPrivateInaccessible && !hasVisibleSections ? (
            <EmptyState
              body="This profile does not have any shared watchlists or activity previews to show right now."
              heading="Nothing shared yet"
              icon={<Users aria-hidden="true" className="size-5" />}
            />
          ) : null}
        </div>

        <div className="motion-stagger space-y-10">
          {!isBlockedProfile && !isPrivateInaccessible && hasWatchlistsSection ? (
            <section className="space-y-5">
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
            <section className="space-y-5">
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
            <WatchedMediaSection
              emptyBody={isSelf ? 'Watched movies will show up here as you keep tracking titles.' : 'No watched movie preview is visible on this profile yet.'}
              heading={isSelf ? 'Movies you watched' : 'Movies watched'}
              items={profile.moviesWatched!.content}
            />
          ) : null}

          {!isBlockedProfile && !isPrivateInaccessible && hasShowsWatchedSection ? (
            <WatchedMediaSection
              emptyBody={isSelf ? 'Watched shows will show up here as you keep tracking titles.' : 'No watched show preview is visible on this profile yet.'}
              heading={isSelf ? 'Shows you watched' : 'Shows watched'}
              items={profile.showsWatched!.content}
            />
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  Clock3,
  PlayCircle,
  Sparkles,
  Tv2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { dashboardApi } from '../api/dashboardApi'
import { BrowsePageAtmosphere } from '../components/browse/BrowsePageAtmosphere'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { Skeleton, SkeletonPoster } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { MediaGrid } from '../components/media/MediaGrid'
import { MediaRail } from '../components/media/MediaRail'
import { PosterCard } from '../components/media/PosterCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type {
  CalendarItemDTO,
  ContinueWatchingItemDTO,
  UpcomingEpisodeItemDTO,
} from '../types/api'
import {
  formatCalendarDateHeading,
  formatDaysUntilLabel,
  formatDisplayDate,
  getIsoDate,
} from '../utils/dates'
import { formatMediaType, formatTmdbShowStatus, formatWatchStatus } from '../utils/labels'
import { getMediaRoute } from '../utils/mediaRoutes'
import { getBackdropUrl } from '../utils/tmdbImages'

function DashboardLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:pt-10">
      <BrowsePageAtmosphere variant="hero" />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[34rem] rounded-[20px]" />
        <div className="grid gap-4">
          <Skeleton className="h-52 rounded-[18px]" />
          <Skeleton className="h-52 rounded-[18px]" />
        </div>
      </div>
      <div className="space-y-5">
        <Skeleton className="h-8 w-64 rounded-[14px]" />
        <div className="flex gap-4 overflow-hidden">
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
        </div>
      </div>
      <div className="grid gap-6">
        <Skeleton className="h-56 rounded-[18px]" />
        <Skeleton className="h-56 rounded-[18px]" />
      </div>
    </PageContainer>
  )
}

function getDashboardHero(
  continueWatching: ContinueWatchingItemDTO[],
  upcoming: UpcomingEpisodeItemDTO[],
) {
  return continueWatching[0] ?? upcoming[0] ?? null
}

function groupCalendarItems(items: CalendarItemDTO[]) {
  return items.reduce<Array<{ date: string; items: CalendarItemDTO[] }>>((groups, item) => {
    if (item.airDate === null) {
      return groups
    }

    const currentGroup = groups.find((group) => group.date === item.airDate)

    if (currentGroup) {
      currentGroup.items.push(item)
      return groups
    }

    groups.push({
      date: item.airDate,
      items: [item],
    })
    return groups
  }, [])
}

function UpcomingStackCard({ item }: { item: UpcomingEpisodeItemDTO }) {
  return (
    <Link className="block focus-visible:outline-none" to={getMediaRoute(item.tmdbId, item.type)}>
      <Card className="h-full border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
                Upcoming episode
              </p>
              <h3 className="font-display text-[2rem] tracking-[-0.04em] text-white">{item.title}</h3>
            </div>
            <div className="rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
              {formatDaysUntilLabel(item.daysUntilAirDate)}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-text-secondary)]">
            {item.nextEpisodeName ? (
              <span className="inline-flex items-center gap-2">
                <Tv2 aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                {item.nextEpisodeName}
              </span>
            ) : null}
            {(item.nextEpisodeSeasonNumber !== null && item.nextEpisodeEpisodeNumber !== null) ? (
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                Season {item.nextEpisodeSeasonNumber} Episode {item.nextEpisodeEpisodeNumber}
              </span>
            ) : null}
            {item.nextEpisodeAirDate ? (
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                {formatDisplayDate(item.nextEpisodeAirDate)}
              </span>
            ) : null}
          </div>
          {formatTmdbShowStatus(item.tmdbShowStatus) ? (
            <p className="text-sm text-[color:var(--color-text-tertiary)]">
              {formatTmdbShowStatus(item.tmdbShowStatus)}
            </p>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}

export function DashboardPage() {
  const [rangeDays, setRangeDays] = useState(30)
  const fromDate = useMemo(() => getIsoDate(0), [])
  const toDate = useMemo(() => getIsoDate(rangeDays), [rangeDays])

  const continueWatchingQuery = useQuery({
    queryFn: () => dashboardApi.getContinueWatching(20),
    queryKey: ['dashboard', 'continue-watching', 20],
  })

  const upcomingEpisodesQuery = useQuery({
    queryFn: dashboardApi.getUpcomingEpisodes,
    queryKey: ['dashboard', 'upcoming-episodes'],
  })

  const calendarQuery = useQuery({
    queryFn: () => dashboardApi.getCalendar(fromDate, toDate),
    queryKey: ['dashboard', 'calendar', fromDate, toDate],
  })

  if (
    continueWatchingQuery.isLoading
    || upcomingEpisodesQuery.isLoading
    || calendarQuery.isLoading
  ) {
    return <DashboardLoadingState />
  }

  const continueWatchingItems = continueWatchingQuery.data?.items ?? []
  const upcomingItems = upcomingEpisodesQuery.data?.items ?? []
  const calendarItems = calendarQuery.data?.items ?? []
  const hero = getDashboardHero(continueWatchingItems, upcomingItems)
  const calendarGroups = groupCalendarItems(calendarItems)
  const featuredUpcoming = upcomingItems[0] ?? null
  const secondaryUpcoming = upcomingItems.slice(1, 4)

  return (
    <PageContainer className="relative isolate space-y-12 overflow-hidden pt-8 md:space-y-14 md:pt-10">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 grid gap-5 xl:grid-cols-[1.18fr_0.82fr] xl:items-stretch">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,19,23,0.96)_0%,rgba(11,12,15,1)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
          {hero && 'backdropPath' in hero && hero.backdropPath ? (
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-55"
              src={getBackdropUrl(hero.backdropPath, 'w1280') ?? undefined}
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.18),transparent_24%),linear-gradient(180deg,rgba(7,8,11,0.12)_0%,rgba(7,8,11,0.3)_18%,rgba(7,8,11,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,13,0.96)_8%,rgba(10,10,13,0.74)_46%,rgba(10,10,13,0.28)_100%)]" />

          <div className="relative z-10 flex h-full min-h-[34rem] flex-col justify-end px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
            <div className="motion-stagger max-w-3xl space-y-5">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  Dashboard
                </p>
                <h1 className="font-display text-[3.4rem] leading-[0.92] tracking-[-0.055em] text-white sm:text-[4.4rem] md:text-[5.3rem]">
                  {hero ? hero.title : 'What should you watch next?'}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)] md:text-lg">
                  {hero
                    ? (
                      'resumeSeasonNumber' in hero && hero.resumeSeasonNumber && hero.resumeEpisodeNumber
                        ? `Pick up ${hero.title} at Season ${hero.resumeSeasonNumber} Episode ${hero.resumeEpisodeNumber}, then scan what is airing next.`
                        : `Your watch-next command center keeps resume points, upcoming episodes, and release timing in one place.`
                    )
                    : 'Your watch-next command center for resume points, upcoming episodes, and the releases you care about most.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {hero ? (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[rgba(216,226,255,0.28)] bg-[color:var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#122f5f] shadow-[0_12px_30px_var(--color-accent-glow)] transition duration-300 hover:brightness-[1.04]"
                    to={getMediaRoute(hero.tmdbId, hero.type)}
                  >
                    {'resumeSeasonNumber' in hero ? 'Jump back in' : 'Open title'}
                  </Link>
                ) : null}
                <Button onClick={() => setRangeDays(14)} variant="secondary">
                  14 day view
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="motion-stagger grid gap-4">
          <Card className="border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-5">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
                Upcoming episodes
              </p>
              <h2 className="font-display text-[2.3rem] tracking-[-0.04em] text-white">
                Next on your list
              </h2>
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Episodes airing soon stay stacked here so the next watch is always obvious.
              </p>
            </div>
          </Card>

          {upcomingEpisodesQuery.isError ? (
            <ErrorState
              action={
                <Button onClick={() => upcomingEpisodesQuery.refetch()} variant="secondary">
                  Try again
                </Button>
              }
              body="We couldn't load your upcoming episodes right now."
              heading="Upcoming episodes are unavailable"
            />
          ) : upcomingItems.length > 0 ? (
            <>
              <UpcomingStackCard item={featuredUpcoming ?? upcomingItems[0]} />
              {secondaryUpcoming.map((item) => (
                <UpcomingStackCard item={item} key={`${item.tmdbId}-${item.nextEpisodeEpisodeNumber ?? 'x'}`} />
              ))}
            </>
          ) : (
            <EmptyState
              body="When shows you track have confirmed upcoming episodes, this section will keep them easy to spot."
              heading="No upcoming episodes right now"
              icon={<Sparkles aria-hidden="true" className="size-5" />}
            />
          )}
        </div>
      </section>

      <section className="relative z-10 space-y-5">
        <SectionHeader eyebrow="Resume now" title="Continue watching" />
        {continueWatchingQuery.isError ? (
          <ErrorState
            action={
              <Button onClick={() => continueWatchingQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            body="We couldn't load your current queue right now."
            heading="Continue watching is unavailable"
          />
        ) : continueWatchingItems.length > 0 ? (
          <MediaRail className="pr-0">
            {continueWatchingItems.map((item) => (
              <PosterCard
                key={`${item.type}-${item.tmdbId}`}
                href={getMediaRoute(item.tmdbId, item.type)}
                imagePath={item.posterPath}
                mediaTypeLabel={
                  item.type === 'SHOW' && item.resumeSeasonNumber && item.resumeEpisodeNumber
                    ? `Resume S${item.resumeSeasonNumber} E${item.resumeEpisodeNumber}`
                    : formatWatchStatus(item.watchStatus)
                }
                rating={item.rating}
                title={item.title}
              />
            ))}
          </MediaRail>
        ) : (
          <EmptyState
            action={
              <Link
                className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[#122f5f] transition hover:bg-[color:var(--color-accent-strong)]"
                to="/discover"
              >
                Find something new
              </Link>
            }
            body="Start tracking a movie or show and it will show up here when you have something to pick back up."
            heading="Nothing to resume yet"
            icon={<PlayCircle aria-hidden="true" className="size-5" />}
          />
        )}
      </section>

      <section className="relative z-10 space-y-6">
        <SectionHeader
          action={
            <div className="flex gap-2">
              {[14, 30].map((days) => (
                <Button
                  key={days}
                  onClick={() => setRangeDays(days)}
                  variant={rangeDays === days ? 'secondary' : 'ghost'}
                >
                  {days} days
                </Button>
              ))}
            </div>
          }
          eyebrow="Calendar"
          title="Release calendar"
        />
        {calendarQuery.isError ? (
          <ErrorState
            action={
              <Button onClick={() => calendarQuery.refetch()} variant="secondary">
                Try again
              </Button>
            }
            body="We couldn't load the calendar window right now."
            heading="Calendar is unavailable"
          />
        ) : calendarGroups.length > 0 ? (
          <div className="grid gap-8">
            {calendarGroups.map((group) => (
              <div
                className="grid gap-6 border-t border-white/6 pt-8 first:border-t-0 first:pt-0 lg:grid-cols-[170px_1fr]"
                key={group.date}
              >
                <div className="space-y-3 lg:sticky lg:top-28 lg:self-start">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                    On the calendar
                  </p>
                  <h3 className="font-display text-[2.6rem] leading-none tracking-[-0.05em] text-white">
                    {formatCalendarDateHeading(group.date)}
                  </h3>
                  <div className="inline-flex rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
                    {group.items.length} {group.items.length === 1 ? 'release' : 'releases'}
                  </div>
                </div>

                <MediaGrid className="gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <Link
                      className="block focus-visible:outline-none"
                      key={`${group.date}-${item.tmdbId}-${item.episodeNumber ?? 'x'}`}
                      to={getMediaRoute(item.tmdbId, item.type)}
                    >
                      <Card className="h-full border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <div className="mt-3 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                          {item.episodeTitle ? <p>{item.episodeTitle}</p> : null}
                          <p>{formatMediaType(item.type)}</p>
                          {(item.seasonNumber !== null && item.episodeNumber !== null) ? (
                            <p>Season {item.seasonNumber} Episode {item.episodeNumber}</p>
                          ) : null}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </MediaGrid>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            body="There are no scheduled releases in this calendar window yet. Try a wider range or check back soon."
            heading="Nothing lined up in this range"
            icon={<CalendarDays aria-hidden="true" className="size-5" />}
          />
        )}
      </section>
    </PageContainer>
  )
}

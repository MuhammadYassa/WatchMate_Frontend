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
import { BackdropHero } from '../components/media/BackdropHero'
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

function DashboardLoadingState() {
  return (
    <PageContainer className="relative isolate space-y-8 overflow-hidden pt-8 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />
      <Skeleton className="relative z-10 h-[360px] rounded-[36px]" />
      <div className="relative z-10 space-y-5">
        <Skeleton className="h-8 w-64 rounded-[14px]" />
        <div className="flex gap-4 overflow-hidden">
          <SkeletonPoster />
          <SkeletonPoster />
          <SkeletonPoster />
        </div>
      </div>
      <div className="relative z-10 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-[28px]" />
        <Skeleton className="h-56 rounded-[28px]" />
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
  const secondaryUpcoming = upcomingItems.slice(1)

  return (
    <PageContainer className="relative isolate space-y-10 overflow-hidden pt-8 md:space-y-12 md:pt-12">
      <BrowsePageAtmosphere variant="hero" />

      <section className="relative z-10 space-y-5">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
            Dashboard
          </p>
          <h1 className="font-display text-5xl tracking-[-0.05em] text-white md:text-6xl">
            What should you watch next?
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
            Your watch-next command center for resume points, upcoming episodes, and the releases you care about most.
          </p>
        </div>

        {hero ? (
          <BackdropHero
            ctaHref={getMediaRoute(hero.tmdbId, hero.type)}
            ctaLabel={hero.type === 'SHOW' ? 'Jump back in' : 'Open title'}
            imagePath={hero.backdropPath}
            meta="Your next watch"
            subtitle={
              'resumeSeasonNumber' in hero && hero.resumeSeasonNumber && hero.resumeEpisodeNumber
                ? `Pick up ${hero.title} at Season ${hero.resumeSeasonNumber} Episode ${hero.resumeEpisodeNumber}, or browse what is coming up next.`
                : `Your dashboard keeps upcoming episodes, resume points, and what to queue next in one place.`
            }
            title={hero.title}
          />
        ) : (
          <Card className="border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
              Your dashboard
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.05em] text-white md:text-6xl">
              What should you watch next?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-text-secondary)]">
              This is where resume points, upcoming episodes, and your next picks will come together as you keep tracking titles.
            </p>
          </Card>
        )}
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
          <MediaRail className="pr-2">
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
              <Link className="inline-flex min-h-11 items-center rounded-2xl bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[#122f5f] transition hover:bg-[color:var(--color-accent-strong)]" to="/discover">
                Find something new
              </Link>
            }
            body="Start tracking a movie or show and it will show up here when you have something to pick back up."
            heading="Nothing to resume yet"
            icon={<PlayCircle aria-hidden="true" className="size-5" />}
          />
        )}
      </section>

      <section className="relative z-10 space-y-5">
        <SectionHeader eyebrow="Coming up" title="Upcoming episodes" />
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
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.95fr]">
            {featuredUpcoming ? (
              <Link className="focus-visible:outline-none" to={getMediaRoute(featuredUpcoming.tmdbId, featuredUpcoming.type)}>
                <Card className="h-full overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-0 shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
                  <div className="relative min-h-[320px] overflow-hidden">
                    {featuredUpcoming.backdropPath ? (
                      <img
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-45"
                        src={`https://image.tmdb.org/t/p/w780${featuredUpcoming.backdropPath}`}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,11,0.15)_0%,rgba(7,8,11,0.82)_72%,rgba(7,8,11,0.98)_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.16)_0%,rgba(173,198,255,0)_34%)]" />
                    <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-end p-6 md:p-8">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="rounded-[14px] border border-[rgba(173,198,255,0.3)] bg-[rgba(216,226,255,0.16)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                          {formatDaysUntilLabel(featuredUpcoming.daysUntilAirDate)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                          Upcoming episode
                        </p>
                        <h3 className="font-display text-4xl tracking-[-0.04em] text-white md:text-5xl">
                          {featuredUpcoming.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-text-secondary)]">
                          {featuredUpcoming.nextEpisodeName ? (
                            <span className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-3 py-2">
                              <Tv2 aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                              {featuredUpcoming.nextEpisodeName}
                            </span>
                          ) : null}
                          {(featuredUpcoming.nextEpisodeSeasonNumber !== null && featuredUpcoming.nextEpisodeEpisodeNumber !== null) ? (
                            <span className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-3 py-2">
                              <Clock3 aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                              Season {featuredUpcoming.nextEpisodeSeasonNumber} Episode {featuredUpcoming.nextEpisodeEpisodeNumber}
                            </span>
                          ) : null}
                          {featuredUpcoming.nextEpisodeAirDate ? (
                            <span className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-3 py-2">
                              <CalendarDays aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                              {formatDisplayDate(featuredUpcoming.nextEpisodeAirDate)}
                            </span>
                          ) : null}
                        </div>
                        {formatTmdbShowStatus(featuredUpcoming.tmdbShowStatus) ? (
                          <p className="text-sm text-[color:var(--color-text-tertiary)]">
                            {formatTmdbShowStatus(featuredUpcoming.tmdbShowStatus)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ) : null}

            <div className="grid gap-4">
              {(secondaryUpcoming.length > 0 ? secondaryUpcoming : featuredUpcoming ? [featuredUpcoming] : []).map((item) => (
                <Link className="focus-visible:outline-none" key={`${item.tmdbId}-${item.nextEpisodeEpisodeNumber ?? 'x'}`} to={getMediaRoute(item.tmdbId, item.type)}>
                  <Card className="h-full border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-5 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
                            Upcoming episode
                          </p>
                          <h3 className="font-display text-3xl tracking-[-0.04em] text-white">{item.title}</h3>
                        </div>
                        <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
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
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            body="When shows you track have confirmed upcoming episodes, this section will keep them easy to spot."
            heading="No upcoming episodes right now"
            icon={<Sparkles aria-hidden="true" className="size-5" />}
          />
        )}
      </section>

      <section className="relative z-10 space-y-5">
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
          <div className="grid gap-5">
            {calendarGroups.map((group) => (
              <Card
                className="grid gap-5 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-5 md:grid-cols-[180px_1fr] md:p-6"
                key={group.date}
              >
                <div className="space-y-3 md:pr-4">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                    On the calendar
                  </p>
                  <h3 className="font-display text-3xl tracking-[-0.04em] text-white">
                    {formatCalendarDateHeading(group.date)}
                  </h3>
                  <div className="inline-flex rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
                    {group.items.length} {group.items.length === 1 ? 'release' : 'releases'}
                  </div>
                </div>
                <MediaGrid className="gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <Link className="focus-visible:outline-none" key={`${group.date}-${item.tmdbId}-${item.episodeNumber ?? 'x'}`} to={getMediaRoute(item.tmdbId, item.type)}>
                      <Card className="h-full border-white/10 bg-[rgba(255,255,255,0.03)] p-4 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
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
              </Card>
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

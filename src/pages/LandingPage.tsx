import {
  ArrowRight,
  Compass,
  LibraryBig,
  MessageSquareMore,
  PlayCircle,
  Radar,
  Rows3,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
import { PublicPageAtmosphere } from '../components/public/PublicPageAtmosphere'
import { Card } from '../components/ui/Card'
import { getButtonClassName } from '../components/ui/buttonStyles'
import { cn } from '../utils/cn'
import { getTitleInitials } from '../utils/tmdbImages'

const heroTitles = [
  {
    caption: 'Discover titles',
    className: 'rotate-[-7deg] md:translate-y-10',
    title: 'Dune: Part Two',
    tone: 'from-[#14171d] via-[#1d2737] to-[#0d0e11]',
  },
  {
    caption: 'Track progress',
    className: 'translate-y-8 md:-translate-y-2',
    title: 'The Bear',
    tone: 'from-[#11151a] via-[#1b2330] to-[#090b0f]',
  },
  {
    caption: 'Build watchlists',
    className: 'rotate-[5deg] md:translate-y-16',
    title: 'Blade Runner 2049',
    tone: 'from-[#161922] via-[#2a2530] to-[#101217]',
  },
  {
    caption: 'Follow viewers',
    className: 'rotate-[-3deg] md:translate-y-3',
    title: 'Severance',
    tone: 'from-[#101319] via-[#162534] to-[#090b0f]',
  },
]

const featureBlocks = [
  {
    copy: 'Move between search and discovery without losing the cinematic focus of the page.',
    icon: Compass,
    title: 'Discover movies and shows',
  },
  {
    copy: 'Keep movie statuses and show progress in sync so you always know what comes next.',
    icon: Radar,
    title: 'Track your watch progress',
  },
  {
    copy: 'Save future picks into focused shelves for weekends, rewatches, or long-running obsessions.',
    icon: LibraryBig,
    title: 'Build watchlists',
  },
  {
    copy: 'Write quick takes or full reactions so the titles you finish leave a lasting record.',
    icon: MessageSquareMore,
    title: 'Review what you watch',
  },
  {
    copy: 'Search for people, follow public or private profiles, and stay connected to other viewers.',
    icon: Users,
    title: 'Follow other viewers',
  },
]

function HeroPosterTile({
  caption,
  className,
  title,
  tone,
}: {
  caption: string
  className?: string
  title: string
  tone: string
}) {
  return (
    <div
      className={cn(
        'motion-poster relative aspect-[2/3] overflow-hidden rounded-[18px] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.38)]',
        className,
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', tone)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.16),_transparent_38%),linear-gradient(180deg,transparent_26%,rgba(9,11,15,0.95)_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">
        <span>{caption}</span>
        <span>Preview</span>
      </div>
      <div className="absolute inset-x-5 bottom-5">
        <div className="mb-2 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-accent)]">
          {getTitleInitials(title)}
        </div>
        <p className="line-clamp-2 text-base font-medium text-white">{title}</p>
      </div>
    </div>
  )
}

function LibraryShowcaseCard() {
  return (
    <Card className="relative overflow-hidden p-6 md:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.14),transparent_36%)]" />
      <div className="relative space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            Track progress
          </p>
          <h3 className="font-display text-[2.1rem] leading-tight tracking-[-0.04em] text-white">
            Your library, framed like a late-night screening list.
          </h3>
        </div>

        <div className="space-y-5 rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-white">The Bear</span>
              <span className="text-[color:var(--color-text-secondary)]">Season 2 Episode 6</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] bg-[color:var(--color-accent)]" />
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { meta: 'Weekend watchlist', title: 'Dune: Part Two' },
              { meta: 'Saved for later', title: 'Severance' },
            ].map((item) => (
              <div
                className="flex items-center gap-4 rounded-[14px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-3"
                key={item.title}
              >
                <div className="grid size-12 place-items-center rounded-[12px] border border-white/10 bg-[rgba(173,198,255,0.08)] font-display text-lg text-[color:var(--color-accent)]">
                  {getTitleInitials(item.title)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                    {item.meta}
                  </p>
                </div>
                <Rows3 aria-hidden="true" className="size-4 text-[color:var(--color-text-tertiary)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function CommunityShowcaseCard() {
  return (
    <Card className="relative overflow-hidden p-6 md:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,222,164,0.12),transparent_30%)]" />
      <div className="relative space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-accent-strong)]">
            Review and follow
          </p>
          <h3 className="font-display text-[2.1rem] leading-tight tracking-[-0.04em] text-white">
            Share what landed, then find the people whose taste keeps paying off.
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-[12px] border border-white/10 bg-[rgba(173,198,255,0.12)] font-semibold text-[color:var(--color-accent)]">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Quick review</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                  Supported in WatchMate
                </p>
              </div>
            </div>
            <p className="text-sm italic leading-7 text-[color:var(--color-text-secondary)]">
              "A rewatch worth making space for. The kind of sci-fi that keeps unfolding after the credits."
            </p>
          </div>

          <div className="rounded-[18px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] font-semibold text-white">
                AV
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Follow other viewers</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                  Private or public profiles
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              Search for profiles, follow your favorite curators, and keep tabs on the people who help you find the next watch.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function LandingPage() {
  return (
    <PageContainer className="relative isolate space-y-24 overflow-hidden pt-0 md:space-y-32 md:pt-0">
      <PublicPageAtmosphere variant="landing" />

      <section className="-mx-4 relative min-h-[88vh] overflow-hidden border-b border-white/6 sm:-mx-6 lg:-mx-8 xl:-mx-12">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,11,15,0.95)_10%,rgba(10,11,15,0.72)_42%,rgba(10,11,15,0.26)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(173,198,255,0.16),transparent_22%),radial-gradient(circle_at_88%_72%,rgba(255,222,164,0.08),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_16%,rgba(13,14,17,0)_70%,rgba(13,14,17,0.98)_100%)]" />
        <div className="absolute right-[-4%] top-28 hidden h-[34rem] w-[52rem] rotate-[-8deg] rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(34,39,48,0.84)_0%,rgba(13,15,20,0.24)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.4)] lg:block" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-[1440px] items-end px-4 pb-14 pt-32 sm:px-6 md:pb-18 lg:px-8 xl:px-12">
          <div className="grid w-full gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end lg:gap-14">
            <div className="motion-stagger max-w-3xl space-y-8">
              <div className="space-y-5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
                  Movie and TV tracking
                </p>
                <h1 className="font-display text-[3.8rem] leading-[0.92] tracking-[-0.055em] text-white sm:text-[4.7rem] md:text-[5.8rem] lg:text-[6.4rem]">
                  Track what you love.
                </h1>
                <p className="max-w-xl text-base leading-8 text-[color:var(--color-text-secondary)] md:text-lg">
                  WatchMate is a cinematic home for discovering titles, tracking watch progress, building watchlists, reviewing what you watch, and following other viewers.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className={getButtonClassName('primary', 'min-w-[11.5rem]')} to="/register">
                  Start tracking
                </Link>
                <Link className={getButtonClassName('secondary', 'min-w-[11.5rem]')} to="/home">
                  Explore titles
                </Link>
              </div>

              <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                {[
                  'Discover movies and shows',
                  'Track watch progress',
                  'Build watchlists',
                  'Review what you watch',
                ].map((label) => (
                  <div
                    className="rounded-[12px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]"
                    key={label}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="motion-stagger grid grid-cols-2 gap-4 pb-4 md:gap-5 lg:pb-0 lg:pl-8">
              {heroTitles.map(({ caption, className, title, tone }) => (
                <HeroPosterTile
                  caption={caption}
                  className={className}
                  key={title}
                  title={title}
                  tone={tone}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative space-y-8">
        <SectionHeader eyebrow="Discover" title="Find the next obsession in a poster-first canvas." />
        <div className="grid gap-4 lg:grid-cols-[1.22fr_0.78fr]">
          <Card className="relative min-h-[26rem] overflow-hidden p-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,24,33,0.28)_0%,rgba(11,12,15,0.94)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,198,255,0.16),transparent_28%)]" />
            <div className="relative flex h-full min-h-[26rem] flex-col justify-end p-7 md:p-9">
              <span className="mb-4 inline-flex w-fit rounded-[10px] border border-[rgba(173,198,255,0.24)] bg-[rgba(216,226,255,0.1)] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                Discover movies and shows
              </span>
              <h2 className="max-w-xl font-display text-[2.5rem] leading-tight tracking-[-0.04em] text-white md:text-[3rem]">
                Browse a darker, editorial watch canvas instead of a generic catalog.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[color:var(--color-text-secondary)]">
                WatchMate keeps the visual weight on the titles themselves, so home, discover, and search feel like places to wander rather than admin screens.
              </p>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {featureBlocks.slice(0, 2).map(({ copy, icon: Icon, title }) => (
              <Card className="p-5" key={title}>
                <div className="mb-5 flex size-11 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-accent)]">
                  <Icon aria-hidden="true" className="size-4.5" />
                </div>
                <h3 className="font-display text-[1.8rem] leading-tight tracking-[-0.04em] text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {copy}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div className="space-y-6">
          <SectionHeader eyebrow="Organization" title="Track progress and build watchlists without losing the mood." />
          <p className="max-w-xl text-base leading-8 text-[color:var(--color-text-secondary)]">
            Keep movie statuses, canonical show progress, and future picks in one place. The tracking tools stay practical, but the presentation still feels like part of the same cinematic world.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureBlocks.slice(2, 4).map(({ copy, icon: Icon, title }) => (
              <Card className="p-5" key={title}>
                <div className="mb-5 flex size-11 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-accent)]">
                  <Icon aria-hidden="true" className="size-4.5" />
                </div>
                <h3 className="font-display text-[1.65rem] leading-tight tracking-[-0.04em] text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {copy}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <LibraryShowcaseCard />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <CommunityShowcaseCard />

        <Card className="p-6 md:p-7">
          <div className="mb-6 flex size-12 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-accent)]">
            <Users aria-hidden="true" className="size-5" />
          </div>
          <SectionHeader
            eyebrow="Social"
            title="Follow other viewers with room for private and public profiles."
          />
          <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Search for other people, send follow requests when profiles are private, and keep the social layer integrated with your watchlists and reviews instead of splitting it into a separate product.
          </p>
          <div className="mt-6 space-y-3">
            {[
              'Search for viewers by username',
              'Follow public or private profiles',
              'See shared watchlists and recent reviews when available',
            ].map((item) => (
              <div
                className="flex items-center gap-3 rounded-[14px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]"
                key={item}
              >
                <PlayCircle aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="-mx-4 relative overflow-hidden border-t border-white/6 bg-[rgba(9,10,13,0.72)] px-4 py-18 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-12 xl:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(173,198,255,0.12),transparent_24%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
            Start now
          </p>
          <h2 className="mt-4 font-display text-[3rem] leading-[0.96] tracking-[-0.05em] text-white md:text-[4.5rem]">
            Build your cinema history, one title at a time.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)]">
            Discover, track, organize, review, and follow without turning the experience into another utility dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className={getButtonClassName('primary', 'min-w-[11.5rem]')} to="/register">
              Start tracking
            </Link>
            <Link className={getButtonClassName('ghost', 'min-w-[11.5rem]')} to="/login">
              Log in <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}

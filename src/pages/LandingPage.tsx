import { ArrowRight, Compass, LibraryBig, MessageSquareMore, Radar, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PublicPageAtmosphere } from '../components/public/PublicPageAtmosphere'
import { PageContainer } from '../components/layout/PageContainer'
import { SectionHeader } from '../components/layout/SectionHeader'
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
    className: 'translate-y-10 md:-translate-y-2',
    title: 'The Bear',
    tone: 'from-[#11151a] via-[#1b2330] to-[#090b0f]',
  },
  {
    caption: 'Write reviews',
    className: 'rotate-[5deg] md:translate-y-20',
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

const valueBlocks = [
  {
    copy: 'Browse movies and shows, jump between search and discover, and keep finding the next thing worth watching.',
    icon: Compass,
    title: 'Discover movies and shows',
  },
  {
    copy: 'Keep movie statuses and show progress in sync so you always know what is next.',
    icon: Radar,
    title: 'Track your watch progress',
  },
  {
    copy: 'Save future picks into watchlists that match your mood, weekend plans, or long-running obsessions.',
    icon: LibraryBig,
    title: 'Build watchlists',
  },
  {
    copy: 'Post quick takes, revisit your ratings, and keep a record of what actually landed for you.',
    icon: MessageSquareMore,
    title: 'Review what you watch',
  },
  {
    copy: 'Search for other viewers, follow private or public profiles, and share the parts of your taste you want seen.',
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
        'relative aspect-[2/3] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_26px_60px_rgba(0,0,0,0.34)]',
        className,
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', tone)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.16),_transparent_38%),linear-gradient(180deg,transparent_30%,rgba(9,11,15,0.94)_100%)]" />
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

export function LandingPage() {
  return (
    <PageContainer className="relative isolate space-y-14 pt-8 md:pt-12">
      <PublicPageAtmosphere variant="landing" />

      <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(17,20,27,0.96)_0%,rgba(24,27,34,0.88)_46%,rgba(12,14,18,0.96)_100%)] px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.32)] md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(173,198,255,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,222,164,0.07),_transparent_22%)]" />
        <div className="absolute inset-y-8 right-[5%] hidden w-[42%] rounded-[34px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%)] lg:block" />

        <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-7">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
              Movie and TV tracking
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl leading-[0.96] tracking-[-0.05em] text-white md:text-7xl lg:text-[5.5rem]">
                Track what you love.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)] md:text-lg">
                WatchMate is a cinematic home for discovering titles, tracking watch progress,
                building watchlists, reviewing what you watch, and following other viewers without
                turning the experience into a cluttered dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={getButtonClassName('primary', 'min-w-40')} to="/register">
                Start tracking
              </Link>
              <Link className={getButtonClassName('secondary', 'min-w-40')} to="/home">
                Explore titles
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-text-secondary)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2">
                Discover, track, review, organize
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2">
                Follow other viewers
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-5 lg:pl-6">
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
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Supported features"
          title="Built around the parts of movie and TV tracking you actually use."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {valueBlocks.map(({ copy, icon: Icon, title }) => (
            <Card key={title} className="space-y-5 p-6">
              <div className="flex size-12 items-center justify-center rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] text-[color:var(--color-accent)]">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-[2rem] leading-tight tracking-[-0.03em] text-white">
                  {title}
                </h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">{copy}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(24,27,34,0.92)_0%,rgba(14,16,20,0.96)_100%)] px-6 py-8 md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(173,198,255,0.12),_transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-accent-strong)]">
              Start watching with context
            </p>
            <h2 className="font-display text-4xl tracking-[-0.04em] text-white md:text-5xl">
              Move from first discovery to final review without losing your place.
            </h2>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)] md:text-base">
              Browse tonight&apos;s next title, keep movie and show progress in one place, save the
              lists that matter, and stay connected to the viewers you want to follow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className={getButtonClassName('primary')} to="/register">
              Start tracking
            </Link>
            <Link className={getButtonClassName('ghost')} to="/login">
              Log in <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}

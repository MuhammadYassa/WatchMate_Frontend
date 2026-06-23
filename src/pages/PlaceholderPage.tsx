import { ArrowRight, Film, Layers3, Sparkles } from 'lucide-react'

import { EmptyState } from '../components/feedback/EmptyState'
import { SkeletonPoster, SkeletonText } from '../components/feedback/Skeleton'
import { PageContainer } from '../components/layout/PageContainer'
import { PosterPlaceholder } from '../components/media/PosterPlaceholder'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

interface PlaceholderPageProps {
  eyebrow: string
  heading: string
  summary: string
}

const foundations = [
  'Polished route shell',
  'Shared browsing components',
  'Typed frontend foundation',
]

export function PlaceholderPage({ eyebrow, heading, summary }: PlaceholderPageProps) {
  return (
    <PageContainer className="space-y-8 pt-8 md:pt-16">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.2),transparent_35%,rgba(255,255,255,0.04)_100%)]" />
          <div className="relative z-10 max-w-2xl space-y-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-300">{eyebrow}</p>
            <h1 className="font-display text-5xl leading-none tracking-[-0.03em] text-white md:text-7xl">
              {heading}
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">{summary}</p>
            <div className="flex flex-wrap gap-3">
              <Button>Route ready</Button>
              <Button variant="secondary">More coming soon</Button>
            </div>
          </div>
        </Card>
        <PosterPlaceholder className="mx-auto max-w-[280px] lg:max-w-none" title={heading} />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {foundations.map((item) => (
          <Card key={item} className="space-y-3 p-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/8 text-fuchsia-200">
              <Sparkles aria-hidden="true" className="size-4" />
            </div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Foundation</p>
            <h2 className="font-display text-2xl text-white">{item}</h2>
            <p className="text-sm text-slate-300">
              This screen stays intentionally focused until its full product flow is ready.
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/8 text-slate-200">
              <Layers3 aria-hidden="true" className="size-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Shared Primitives</p>
              <h2 className="font-display text-2xl text-white">Loading, layout, and polish</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <SkeletonPoster />
            <SkeletonPoster />
            <SkeletonPoster />
          </div>
          <SkeletonText />
        </Card>

        <EmptyState
          action={
            <Button variant="secondary">
              More coming soon <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Button>
          }
          body="This route is wired into the real app shell and held back until its supported product flow is ready."
          heading="Intentional placeholder, no fake product behavior"
          icon={<Film aria-hidden="true" className="size-5" />}
        />
      </section>
    </PageContainer>
  )
}

import { CheckCircle2 } from 'lucide-react'

import type { ShowTrackingDTO } from '../../types/api'
import { Card } from '../ui/Card'

interface ShowProgressCardProps {
  pendingLabel: string | null
  progress: ShowTrackingDTO | null
}

export function ShowProgressCard({ pendingLabel, progress }: ShowProgressCardProps) {
  return (
    <Card className="space-y-5 overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(111,209,168,0.28)_50%,rgba(255,255,255,0)_100%)]" />
      <div className="space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Progress
        </p>
        <h2 className="font-display text-3xl tracking-[-0.04em] text-white">Current watch position</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-panel)] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm text-[color:var(--color-text-secondary)]">
          {progress ? (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-white">
                <CheckCircle2 aria-hidden="true" className="size-4 text-[color:var(--color-accent)]" />
                Latest watched
              </p>
              <p>
                Season {progress.watchPositionSeason ?? '-'} Episode {progress.watchPositionEpisode ?? '-'}
              </p>
            </div>
          ) : (
            <p>No progress saved yet.</p>
          )}
        </div>
        <div className="rounded-[var(--radius-panel)] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm text-[color:var(--color-text-secondary)]">
          {progress ? (
            <p>
              {progress.episodesWatchedCount ?? 0} watched episodes across {progress.seasonsCompletedCount ?? 0} completed seasons.
            </p>
          ) : (
            <p>No watched episodes yet.</p>
          )}
        </div>
      </div>

      {pendingLabel ? (
        <p className="rounded-[var(--radius-panel)] border border-[rgba(47,174,126,0.20)] bg-[rgba(47,174,126,0.08)] px-4 py-3 text-sm text-[color:var(--color-accent)]">
          {pendingLabel}
        </p>
      ) : null}
    </Card>
  )
}

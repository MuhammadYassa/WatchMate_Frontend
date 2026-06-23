import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import { useState } from 'react'

import { showApi } from '../../api/showApi'
import type { ShowSeasonSummaryDTO, ShowTrackingDTO } from '../../types/api'
import { formatSeasonLabel } from '../../utils/labels'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormField } from '../ui/FormField'
import { Select } from '../ui/Select'

interface ShowProgressCardProps {
  onSubmitProgress: (input: { watchPositionEpisode: number; watchPositionSeason: number }) => Promise<unknown> | void
  pending: boolean
  pendingLabel: string | null
  progress: ShowTrackingDTO | null
  seasons: ShowSeasonSummaryDTO[]
  tmdbId: number
}

export function ShowProgressCard({
  onSubmitProgress,
  pending,
  pendingLabel,
  progress,
  seasons,
  tmdbId,
}: ShowProgressCardProps) {
  const trackableSeasons = seasons.filter((season) => season.seasonNumber > 0)
  const [seasonOverride, setSeasonOverride] = useState<number | null>(null)
  const [episodeOverride, setEpisodeOverride] = useState<number | null>(null)

  const selectedSeason = seasonOverride
    ?? progress?.watchPositionSeason
    ?? trackableSeasons[0]?.seasonNumber
    ?? null

  const seasonEpisodesQuery = useQuery({
    enabled: selectedSeason !== null,
    queryFn: () => showApi.getSeasonEpisodes(tmdbId, selectedSeason),
    queryKey: ['season-episodes', tmdbId, selectedSeason],
  })

  const airedEpisodes = seasonEpisodesQuery.data?.episodes.filter((episode) => episode.isAired !== false) ?? []
  const latestAiredEpisode = airedEpisodes[airedEpisodes.length - 1] ?? null
  const progressEpisodeForSelectedSeason =
    progress?.watchPositionSeason === selectedSeason ? progress.watchPositionEpisode : null
  const selectedEpisode =
    episodeOverride ?? progressEpisodeForSelectedSeason ?? latestAiredEpisode?.episodeNumber ?? null

  return (
    <Card className="space-y-5 border-white/10 bg-[linear-gradient(145deg,rgba(20,21,25,0.92)_0%,rgba(12,13,17,0.96)_100%)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
      <div className="space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Progress
        </p>
        <h2 className="font-display text-3xl tracking-[-0.04em] text-white">Set where you are now.</h2>
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          Choose the latest eligible episode you have watched. WatchMate fills in everything before it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm text-[color:var(--color-text-secondary)]">
          {progress ? (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-white">
                <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-300" />
                Current position
              </p>
              <p>
                Season {progress.watchPositionSeason ?? '-'} Episode {progress.watchPositionEpisode ?? '-'}
              </p>
            </div>
          ) : (
            <p>No progress saved yet.</p>
          )}
        </div>
        <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm text-[color:var(--color-text-secondary)]">
          {progress ? (
            <p>
              {progress.episodesWatchedCount} watched episodes across {progress.seasonsCompletedCount} completed seasons.
            </p>
          ) : (
            <p>Pick a season and episode to start tracking.</p>
          )}
        </div>
      </div>

      {pendingLabel ? (
        <p className="rounded-[20px] border border-[rgba(173,198,255,0.22)] bg-[rgba(173,198,255,0.12)] px-4 py-3 text-sm text-[color:var(--color-accent)]">
          {pendingLabel}
        </p>
      ) : null}

      {trackableSeasons.length > 0 ? (
        <div className="grid gap-4">
          <FormField label="Season">
            <Select
              className="bg-[rgba(10,12,16,0.8)]"
              disabled={pending}
              onChange={(event) => {
                setSeasonOverride(Number(event.target.value))
                setEpisodeOverride(null)
              }}
              value={selectedSeason ?? ''}
            >
              {trackableSeasons.map((season) => (
                <option key={season.seasonNumber} value={season.seasonNumber}>
                  {formatSeasonLabel(season.seasonNumber)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            hint={airedEpisodes.length === 0 ? 'This season has no aired episodes available for progress yet.' : undefined}
            label="Latest watched episode"
          >
            <Select
              className="bg-[rgba(10,12,16,0.8)]"
              disabled={pending || airedEpisodes.length === 0 || seasonEpisodesQuery.isLoading || seasonEpisodesQuery.isError}
              onChange={(event) => setEpisodeOverride(Number(event.target.value))}
              value={selectedEpisode ?? ''}
            >
              {airedEpisodes.map((episode) => (
                <option key={episode.episodeNumber} value={episode.episodeNumber}>
                  Episode {episode.episodeNumber}: {episode.name}
                </option>
              ))}
            </Select>
          </FormField>

          {seasonEpisodesQuery.isLoading ? (
            <p className="text-sm text-[color:var(--color-text-tertiary)]">
              Loading aired episodes for this season...
            </p>
          ) : null}

          {seasonEpisodesQuery.isError ? (
            <p className="text-sm text-rose-300">
              We could not load the season episodes right now. Try choosing the season again in a moment.
            </p>
          ) : null}

          <Button
            disabled={
              pending
              || selectedSeason === null
              || selectedEpisode === null
              || airedEpisodes.length === 0
              || seasonEpisodesQuery.isLoading
              || seasonEpisodesQuery.isError
            }
            onClick={() => {
              if (selectedSeason === null || selectedEpisode === null) {
                return
              }

              void onSubmitProgress({
                watchPositionEpisode: selectedEpisode,
                watchPositionSeason: selectedSeason,
              })
              setEpisodeOverride(null)
            }}
            variant="secondary"
          >
            <PlayCircle aria-hidden="true" className="mr-2 size-4" />
            Save progress
          </Button>
        </div>
      ) : (
        <p className="text-sm text-[color:var(--color-text-tertiary)]">
          This show does not have any trackable seasons yet.
        </p>
      )}
    </Card>
  )
}

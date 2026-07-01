import { ExternalLink, Play } from 'lucide-react'

import type { TrailerDTO } from '../../types/api'

export function TrailerCard({ trailer }: { trailer: TrailerDTO }) {
  const typeLabel = [trailer.official ? 'Official' : null, trailer.type].filter(Boolean).join(' ')

  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
      <a
        aria-label={`Watch ${trailer.name} on YouTube (opens in new tab)`}
        className="group relative block aspect-video overflow-hidden"
        href={trailer.youtubeUrl}
        rel="noreferrer"
        target="_blank"
      >
        <img
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-75"
          src={trailer.thumbnailUrl}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.28)] transition duration-300 group-hover:bg-[rgba(0,0,0,0.42)]"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_8px_24px_rgba(0,0,0,0.42)] transition duration-300 group-hover:scale-105 group-hover:bg-white">
            <Play className="ml-1 size-6 fill-current" />
          </div>
        </div>
      </a>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">{trailer.name}</p>
          {typeLabel ? (
            <p className="text-[11px] text-[color:var(--color-text-tertiary)]">{typeLabel}</p>
          ) : null}
        </div>
        <ExternalLink aria-hidden="true" className="size-4 shrink-0 text-[color:var(--color-text-tertiary)]" />
      </div>
    </div>
  )
}

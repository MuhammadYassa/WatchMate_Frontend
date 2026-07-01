import { ExternalLink } from 'lucide-react'
import { useState } from 'react'

import type { WatchProviderEntryDTO, WatchProvidersDTO } from '../../types/api'
import { getPosterUrl } from '../../utils/tmdbImages'

type ProviderGroup = 'flatrate' | 'rent' | 'buy' | 'ads' | 'free'

const GROUPS: readonly ProviderGroup[] = ['flatrate', 'rent', 'buy', 'ads', 'free']

const GROUP_LABELS: Record<ProviderGroup, string> = {
  ads: 'With ads',
  buy: 'Buy',
  flatrate: 'Stream',
  free: 'Free',
  rent: 'Rent',
}

function ProviderLogo({ provider }: { provider: WatchProviderEntryDTO }) {
  const [imgFailed, setImgFailed] = useState(false)
  const logoUrl = provider.logoPath ? getPosterUrl(provider.logoPath, 'w92') : null

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="size-10 overflow-hidden rounded-[var(--radius-control)] border border-white/10 bg-[rgba(255,255,255,0.05)]">
        {logoUrl && !imgFailed ? (
          <img
            alt={provider.providerName}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
            src={logoUrl}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[color:var(--color-text-tertiary)]"
          >
            {provider.providerName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <p className="line-clamp-2 w-10 text-center text-[10px] leading-3 text-[color:var(--color-text-tertiary)]">
        {provider.providerName}
      </p>
    </div>
  )
}

export function WatchProvidersCard({ watchProviders }: { watchProviders: WatchProvidersDTO }) {
  const hasAnyProvider = GROUPS.some((group) => watchProviders[group].length > 0)

  if (!hasAnyProvider && !watchProviders.link) {
    return null
  }

  if (!hasAnyProvider) {
    if (!watchProviders.link) return null
    return (
      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-4">
        <a
          className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-accent)] transition hover:text-white"
          href={watchProviders.link}
          rel="noreferrer"
          target="_blank"
        >
          View availability
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only">(opens in new tab)</span>
        </a>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-[linear-gradient(160deg,rgba(20,21,25,0.9)_0%,rgba(11,12,16,0.98)_100%)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-white">Where to watch</h2>
          {watchProviders.link ? (
            <a
              className="inline-flex items-center gap-1 text-[11px] text-[color:var(--color-text-tertiary)] transition hover:text-white"
              href={watchProviders.link}
              rel="noreferrer"
              target="_blank"
            >
              View all
              <ExternalLink aria-hidden="true" className="size-3" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          ) : null}
        </div>
        <div className="space-y-4">
          {GROUPS.map((group) => {
            const providers = watchProviders[group]
            if (providers.length === 0) return null
            return (
              <div className="space-y-2" key={group}>
                <p className="text-[11px] text-[color:var(--color-text-tertiary)]">{GROUP_LABELS[group]}</p>
                <div className="flex flex-wrap gap-3">
                  {providers.map((provider) => (
                    <ProviderLogo key={provider.providerId} provider={provider} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

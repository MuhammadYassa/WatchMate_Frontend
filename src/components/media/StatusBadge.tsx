import { CheckCircle2, Clock3, Heart, Sparkles } from 'lucide-react'

import { formatFavouriteState, formatWatchStatus } from '../../utils/labels'
import { MetadataPill } from './MetadataPill'

type StatusBadgeTone = 'default' | 'success' | 'accent'

function getToneClassName(tone: StatusBadgeTone) {
  if (tone === 'success') {
    return 'border-[rgba(167,243,208,0.24)] bg-[rgba(6,78,59,0.28)] text-[#d1fae5]'
  }

  if (tone === 'accent') {
    return 'border-[rgba(173,198,255,0.34)] bg-[rgba(216,226,255,0.14)] text-[color:var(--color-accent)]'
  }

  return 'border-white/10 bg-[rgba(10,12,16,0.56)] text-[color:var(--color-text-secondary)]'
}

export function WatchStatusBadge({
  status,
}: {
  status: 'NONE' | 'TO_WATCH' | 'WATCHING' | 'UP_TO_DATE' | 'WATCHED' | null | undefined
}) {
  if (!status) {
    return null
  }

  return (
    <MetadataPill
      className={getToneClassName(status === 'WATCHED' || status === 'UP_TO_DATE' ? 'success' : 'accent')}
    >
      <Clock3 aria-hidden="true" className="size-3.5" />
      {formatWatchStatus(status)}
    </MetadataPill>
  )
}

export function FavouriteStatusBadge({
  isFavourited,
}: {
  isFavourited: boolean | null | undefined
}) {
  const label = formatFavouriteState(isFavourited)
  if (!label) {
    return null
  }

  return (
    <MetadataPill className={getToneClassName(isFavourited ? 'accent' : 'default')}>
      <Heart aria-hidden="true" className="size-3.5" />
      {label}
    </MetadataPill>
  )
}

export function InformationalStatusBadge({
  label,
  tone = 'default',
}: {
  label: string
  tone?: StatusBadgeTone
}) {
  return (
    <MetadataPill className={getToneClassName(tone)}>
      <Sparkles aria-hidden="true" className="size-3.5" />
      {label}
    </MetadataPill>
  )
}

export function CompletionStatusBadge({ label }: { label: string }) {
  return (
    <MetadataPill className={getToneClassName('success')}>
      <CheckCircle2 aria-hidden="true" className="size-3.5" />
      {label}
    </MetadataPill>
  )
}

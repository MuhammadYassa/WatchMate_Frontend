import { useState } from 'react'

import type { CastMemberDTO } from '../../types/api'
import { getPosterUrl, getTitleInitials } from '../../utils/tmdbImages'

function CastMemberCard({ member }: { member: CastMemberDTO }) {
  const [imgFailed, setImgFailed] = useState(false)
  const profileUrl = member.profilePath ? getPosterUrl(member.profilePath, 'w185') : null

  return (
    <div className="flex w-[100px] shrink-0 snap-start flex-col gap-2">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-media)] border border-white/10 bg-[rgba(255,255,255,0.05)]">
        {profileUrl && !imgFailed ? (
          <img
            alt={member.name}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
            src={profileUrl}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-base font-semibold text-[color:var(--color-text-tertiary)]"
          >
            {getTitleInitials(member.name)}
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="line-clamp-2 text-[12px] font-medium leading-[1.4] text-white">{member.name}</p>
        {member.character ? (
          <p className="line-clamp-1 text-[11px] text-[color:var(--color-text-tertiary)]">{member.character}</p>
        ) : null}
      </div>
    </div>
  )
}

export function CastRail({ cast }: { cast: CastMemberDTO[] }) {
  if (cast.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-[15px] font-semibold text-white">Cast</h2>
      {/* Bleeds to the viewport edge on phones so a partially visible card
          signals the rail scrolls; realigned to the column from lg up. */}
      <div className="scrollbar-hide rail-fade-mask -mx-4 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 scroll-pl-4 sm:-mx-6 sm:px-6 sm:scroll-pl-6 lg:mx-0 lg:px-0 lg:scroll-pl-0">
        {cast.map((member) => (
          <CastMemberCard key={member.tmdbPersonId} member={member} />
        ))}
      </div>
    </section>
  )
}

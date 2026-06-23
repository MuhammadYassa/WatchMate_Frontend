import { Heart, ListPlus, LogIn, MessageSquareText, Radar } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getButtonClassName } from '../ui/buttonStyles'
import { Card } from '../ui/Card'

interface ActionPromptProps {
  isAuthenticated: boolean
  returnTo: string
}

export function ActionPrompt({ isAuthenticated, returnTo }: ActionPromptProps) {
  return (
    <Card className="space-y-5 border-white/10 bg-[linear-gradient(145deg,rgba(21,22,27,0.92)_0%,rgba(10,11,15,0.98)_100%)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.36)] md:sticky md:top-28">
      <div className="space-y-2.5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--color-accent-strong)]">
          Your actions
        </p>
        <h2 className="font-display text-3xl tracking-[-0.04em] text-white">
          {isAuthenticated ? 'Tracking actions arrive next.' : 'Sign in to track this title.'}
        </h2>
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          {isAuthenticated
            ? 'Favourite controls, watch status updates, reviews, and progress tools are queued for the next implementation step.'
            : 'Save favourites, update watch status, and post reviews once you sign in.'}
        </p>
      </div>

      <div className="grid gap-3">
        <button className={getButtonClassName('secondary', 'justify-start')} disabled type="button">
          <Heart aria-hidden="true" className="mr-2 size-4" />
          Favourite
        </button>
        <button className={getButtonClassName('secondary', 'justify-start')} disabled type="button">
          <ListPlus aria-hidden="true" className="mr-2 size-4" />
          Add to watchlist
        </button>
        <button className={getButtonClassName('secondary', 'justify-start')} disabled type="button">
          <Radar aria-hidden="true" className="mr-2 size-4" />
          Update watch status
        </button>
        <button className={getButtonClassName('secondary', 'justify-start')} disabled type="button">
          <MessageSquareText aria-hidden="true" className="mr-2 size-4" />
          Write a review
        </button>
      </div>

      {!isAuthenticated ? (
        <Link className={getButtonClassName('primary', 'w-full')} to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
          <LogIn aria-hidden="true" className="mr-2 size-4" />
          Sign in to track
        </Link>
      ) : (
        <p className="text-xs leading-6 text-[color:var(--color-text-tertiary)]">
          This area stays read-only in Phase 3A. No tracking or favourite changes are sent yet.
        </p>
      )}
    </Card>
  )
}

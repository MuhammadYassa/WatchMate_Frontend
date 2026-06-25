import { cn } from '../../utils/cn'

interface BrowsePageAtmosphereProps {
  className?: string
  variant?: 'default' | 'hero'
}

export function BrowsePageAtmosphere({
  className,
  variant = 'default',
}: BrowsePageAtmosphereProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="ambient-drift absolute left-[-14%] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(173,198,255,0.16)_0%,rgba(173,198,255,0)_72%)] blur-3xl" />
      <div className="ambient-drift absolute right-[-12%] top-[20%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(244,211,94,0.12)_0%,rgba(244,211,94,0)_72%)] blur-3xl [animation-delay:-6s]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_100%)]" />
      {variant === 'hero' ? (
        <>
          <div className="absolute left-[10%] top-28 h-48 w-48 rounded-full border border-white/6 bg-[rgba(255,255,255,0.02)] blur-2xl" />
          <div className="absolute right-[8%] top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_70%)] blur-3xl" />
        </>
      ) : null}
    </div>
  )
}

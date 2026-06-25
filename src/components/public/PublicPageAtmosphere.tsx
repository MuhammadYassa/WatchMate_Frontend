import { cn } from '../../utils/cn'

interface PublicPageAtmosphereProps {
  className?: string
  variant?: 'auth' | 'landing' | 'verify'
}

export function PublicPageAtmosphere({
  className,
  variant = 'auth',
}: PublicPageAtmosphereProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.1),_transparent_24%),linear-gradient(180deg,rgba(18,19,23,0.36)_0%,rgba(13,14,17,0.94)_100%)]" />
      <div className="ambient-drift absolute left-[-8%] top-14 h-72 w-72 rounded-full bg-[rgba(173,198,255,0.08)] blur-[100px]" />
      <div className="ambient-drift absolute bottom-[-12%] right-[-6%] h-80 w-80 rounded-full bg-[rgba(255,222,164,0.05)] blur-[120px] [animation-delay:-6s]" />

      {variant === 'landing' ? (
        <>
          <div className="absolute left-[10%] top-10 h-[30rem] w-[80%] rounded-[32px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute right-[8%] top-28 h-[24rem] w-[34rem] rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(173,198,255,0.14),_transparent_42%),linear-gradient(180deg,rgba(28,31,37,0.92)_0%,rgba(13,14,17,0.35)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28)]" />
          <div className="absolute bottom-[14%] left-[8%] h-28 w-64 rounded-full bg-[rgba(173,198,255,0.05)] blur-[72px]" />
        </>
      ) : null}

      {variant === 'auth' ? (
        <>
          <div className="absolute left-1/2 top-[12%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-white/6 opacity-30" />
          <div className="absolute left-1/2 top-[17%] h-[22rem] w-[22rem] -translate-x-1/2 rounded-full border border-white/6 opacity-30" />
          <div className="absolute left-1/2 top-[22%] h-[14rem] w-[14rem] -translate-x-1/2 rounded-full border border-white/6 opacity-20" />
          <div className="absolute left-1/2 top-[20%] h-56 w-[70%] max-w-4xl -translate-x-1/2 rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(173,198,255,0.05)_0%,rgba(255,255,255,0.01)_100%)]" />
        </>
      ) : null}

      {variant === 'verify' ? (
        <>
          <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6 opacity-30" />
          <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6 opacity-25" />
          <div className="absolute inset-x-[14%] top-20 h-[24rem] rounded-[24px] border border-white/6 bg-[linear-gradient(180deg,rgba(173,198,255,0.05)_0%,rgba(255,255,255,0)_100%)]" />
        </>
      ) : null}
    </div>
  )
}

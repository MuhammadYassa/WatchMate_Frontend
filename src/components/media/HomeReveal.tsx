import { useEffect, useRef, type PropsWithChildren } from 'react'

/** Presentation only: content stays visible without JavaScript or animation support. */
export function HomeReveal({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!section || reduced?.matches || typeof IntersectionObserver === 'undefined' || !section.animate) return
    const targets = section.querySelectorAll<HTMLElement>('.poster-editorial')
    if (!targets.length) return

    const animations: Animation[] = []
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (document.visibilityState === 'hidden' || reduced?.matches) return
      let visibleIndex = 0
      targets.forEach((target) => {
        const bounds = target.getBoundingClientRect()
        if (bounds.left >= window.innerWidth || bounds.right <= 0 || bounds.top >= window.innerHeight || bounds.bottom <= 0) return
        animations.push(target.animate([
          { opacity: 0.88, transform: 'translateY(18px) scale(0.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ], {
          duration: 420,
          delay: Math.min(visibleIndex++ * 24, 96),
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        }))
      })
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' })
    const finish = () => {
      observer.disconnect()
      animations.forEach((animation) => animation.finish())
    }
    observer.observe(section.querySelector('.home-rail') ?? section)
    // Keyboard navigation and preference changes never wait for a reveal.
    section.addEventListener('focusin', finish)
    reduced?.addEventListener('change', finish)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      section.removeEventListener('focusin', finish)
      reduced?.removeEventListener('change', finish)
    }
  }, [])

  return <section className={className} ref={sectionRef}>{children}</section>
}

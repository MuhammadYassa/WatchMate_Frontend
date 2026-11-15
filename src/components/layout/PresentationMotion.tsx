import { useEffect } from 'react'

/** DOM-only enhancement. Never keys, delays, or remounts routed content. */
export function PresentationMotion({ pathname }: { pathname: string }) {
  useEffect(() => {
    if (pathname === '/' || pathname === '/home' || pathname.includes('/seasons/')) return
    const main = document.querySelector<HTMLElement>('.wm-main')
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!main || preference?.matches || !main.animate || typeof IntersectionObserver === 'undefined') return
    const quiet = ['/dashboard', '/follow-requests', '/social/search', '/login', '/register', '/verify-email', '/terms', '/privacy'].includes(pathname)
    if (quiet) return

    const seen = new WeakSet<Element>()
    const animations: Animation[] = []
    let scanFrame = 0
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        if (document.visibilityState === 'hidden' || preference?.matches) continue
        let index = 0
        entry.target.querySelectorAll<HTMLElement>('.poster-editorial, .wm-season-card').forEach((item) => {
          const box = item.getBoundingClientRect()
          if (box.right <= 0 || box.left >= innerWidth || box.top >= innerHeight || box.bottom <= 0) return
          animations.push(item.animate([
            { opacity: 0.9, transform: 'translateY(14px) scale(0.99)' },
            { opacity: 1, transform: 'none' },
          ], { duration: 380, delay: Math.min(index++ * 24, 96), easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'backwards' }))
        })
      }
    }, { threshold: 0.05 })
    const scan = () => {
      scanFrame = 0
      main.querySelectorAll('.wm-media-grid, .wm-media-rail').forEach((group) => {
        if (seen.has(group) || group.closest('.home-editorial')) return
        seen.add(group)
        observer.observe(group)
      })
    }
    const mutations = new MutationObserver(() => {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan)
    })
    const finish = () => {
      observer.disconnect()
      mutations.disconnect()
      animations.forEach((animation) => animation.finish())
    }
    scan()
    mutations.observe(main, { childList: true, subtree: true })
    main.addEventListener('focusin', finish)
    preference?.addEventListener('change', finish)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      cancelAnimationFrame(scanFrame)
      animations.forEach((animation) => animation.cancel())
      main.removeEventListener('focusin', finish)
      preference?.removeEventListener('change', finish)
    }
  }, [pathname])

  return null
}

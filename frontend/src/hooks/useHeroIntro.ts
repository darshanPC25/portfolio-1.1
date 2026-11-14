import gsap from 'gsap'
import { type RefObject, useLayoutEffect } from 'react'

/**
 * Staggered entrance for elements marked with `data-hero-reveal` inside the
 * given container. Skipped entirely under prefers-reduced-motion.
 */
export function useHeroIntro(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    // Follow wall-clock time, so a slow device finishes the intro on schedule
    // instead of leaving the headline half-faded while frames catch up.
    gsap.ticker.lagSmoothing(0)

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('[data-hero-reveal]', {
          y: 36,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.09,
          delay: 0.1,
          clearProps: 'transform,opacity',
        })
        gsap.from('[data-hero-portrait]', {
          scale: 0.92,
          opacity: 0,
          duration: 1.3,
          ease: 'power3.out',
          delay: 0.25,
          clearProps: 'transform,opacity',
        })
      }, root)
      return () => context.revert()
    })

    return () => media.revert()
  }, [scope])
}

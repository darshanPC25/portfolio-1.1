import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type RefObject, useLayoutEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero choreography, all skipped under prefers-reduced-motion:
 *
 * 1. Entrance: headline words rise out of their masks, the portrait is
 *    unveiled from the bottom while the photo settles from a slight zoom,
 *    then the supporting content (`data-hero-reveal`) fades up in sequence.
 * 2. Scroll: as the hero leaves the screen its content lifts, the headline
 *    softens, and the portrait moves a little slower than the text for depth.
 */
export function useHeroIntro(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    // Follow wall-clock time, so a slow device finishes the intro on schedule
    // instead of leaving the headline half-revealed while frames catch up.
    gsap.ticker.lagSmoothing(0)

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
        intro
          .from('[data-split-word]', { yPercent: 115, rotate: 3, duration: 1.15, stagger: 0.08, clearProps: 'transform' }, 0.15)
          .fromTo(
            '[data-hero-portrait]',
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut', clearProps: 'clipPath' },
            0.35,
          )
          .from('[data-hero-portrait] img', { scale: 1.22, duration: 1.9, ease: 'power3.out', clearProps: 'transform' }, 0.35)
          .from(
            '[data-hero-reveal]',
            { y: 28, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity' },
            0.75,
          )

        const scrub = { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('[data-hero-content]', { yPercent: -10, ease: 'none', scrollTrigger: scrub })
        // Only the headline softens; the portrait stays opaque so the 3D forms never show through it.
        gsap.to('#home-heading', { opacity: 0.25, ease: 'none', scrollTrigger: scrub })
        gsap.to('[data-hero-parallax]', { yPercent: 8, ease: 'none', scrollTrigger: scrub })
      }, root)
      return () => context.revert()
    })

    return () => media.revert()
  }, [scope])
}

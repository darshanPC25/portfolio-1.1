/**
 * Animation conventions shared by the whole site.
 *
 * - One easing curve everywhere (matches --ease-soft in the CSS tokens).
 * - Content reveals rise 24px and fade in once, when scrolled into view.
 * - Grouped items stagger by 80ms.
 * - Hover feedback is a small lift, never a colour flash.
 * - Everything is disabled under prefers-reduced-motion.
 */
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
} as const

export const STAGGER = 0.08

export const REVEAL_DISTANCE = 24

export const VIEWPORT_ONCE = { once: true, margin: '0px 0px -80px 0px' } as const

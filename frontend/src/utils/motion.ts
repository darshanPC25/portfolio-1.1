/**
 * Animation conventions shared by the whole site.
 *
 * - One easing curve everywhere (matches --ease-soft in the CSS tokens).
 * - Content reveals rise 24px and fade in once, when scrolled into view.
 * - Headlines reveal word by word out of a mask, 60ms apart.
 * - Grouped items stagger by 80ms.
 * - Decorative shapes drift with scroll parallax; nothing that carries
 *   meaning moves on scroll.
 * - Hover feedback is a small lift or tilt, never a colour flash.
 * - Everything is disabled under prefers-reduced-motion.
 */
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
} as const

export const STAGGER = 0.08

export const WORD_STAGGER = 0.06

export const REVEAL_DISTANCE = 24

export const VIEWPORT_ONCE = { once: true, margin: '0px 0px -80px 0px' } as const

/** Spring used for pointer-driven motion (card tilt, nav pill). */
export const SOFT_SPRING = { stiffness: 220, damping: 24, mass: 0.6 } as const

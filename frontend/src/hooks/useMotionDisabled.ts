import { useReducedMotion } from 'framer-motion'
import { useContext } from 'react'
import { ContentContext } from '@/contexts/contentContextValue'

/**
 * True when animation should be skipped: the visitor prefers reduced motion,
 * or motion is switched off in the portfolio's Appearance settings.
 * Works outside ContentProvider too (it then follows the visitor only).
 */
export function useMotionDisabled(): boolean {
  const prefersReduced = useReducedMotion()
  const content = useContext(ContentContext)
  return Boolean(prefersReduced) || content?.appearance.motionEnabled === false
}

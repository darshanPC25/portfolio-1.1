import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE_SOFT, REVEAL_DISTANCE, VIEWPORT_ONCE } from '@/utils/motion'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'

interface RevealProps {
  children: ReactNode
  /** Delay in seconds, used to stagger siblings. */
  delay?: number
  className?: string
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useMotionDisabled()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: REVEAL_DISTANCE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: DURATION.base, ease: EASE_SOFT, delay }}
    >
      {children}
    </motion.div>
  )
}

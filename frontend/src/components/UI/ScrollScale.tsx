import { motion, useScroll, useTransform } from 'framer-motion'
import { type ReactNode, useRef } from 'react'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'

interface ScrollScaleProps {
  children: ReactNode
  /** Scale while the block is entering from the bottom of the screen. */
  from?: number
  className?: string
}

/**
 * Section transition for large panels: the block grows from slightly smaller
 * to full size as it scrolls up into view, tied to scroll position.
 */
export function ScrollScale({ children, from = 0.92, className }: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useMotionDisabled()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 35%'] })
  const scale = useTransform(scrollYProgress, [0, 1], [from, 1])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])

  return (
    <motion.div ref={ref} className={className} style={reduceMotion ? undefined : { scale, y }}>
      {children}
    </motion.div>
  )
}

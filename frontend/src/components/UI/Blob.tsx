import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { type CSSProperties, useRef } from 'react'
import { cn } from '@/utils/cn'

interface BlobProps {
  tone?: 'sage' | 'olive' | 'cream'
  /** Perfect sphere instead of an organic shape. */
  round?: boolean
  /** Gentle floating motion. */
  drift?: 'none' | 'normal' | 'slow'
  /**
   * Scroll parallax strength. Positive values drift upward faster than the
   * page; 0 disables it.
   */
  parallax?: number
  /** Positioning and size utilities, e.g. "left-[-4rem] top-10 size-56". */
  className?: string
  style?: CSSProperties
}

/**
 * Decorative sculptural shape drawn with CSS only. Used outside the hero so
 * the page keeps a single WebGL canvas. The outer layer handles scroll
 * parallax, the inner layer the idle drift, so the two never fight.
 */
export function Blob({ tone = 'sage', round = false, drift = 'slow', parallax = 0.5, className, style }: BlobProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [parallax * 90, parallax * -90])
  const still = reduceMotion || parallax === 0

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      style={{ ...style, y: still ? 0 : y }}
      className={cn('pointer-events-none absolute block', className)}
    >
      <span
        className={cn(
          'blob block size-full',
          `blob-${tone}`,
          round && 'blob-round',
          drift === 'normal' && 'animate-drift',
          drift === 'slow' && 'animate-drift-slow',
        )}
      />
    </motion.span>
  )
}

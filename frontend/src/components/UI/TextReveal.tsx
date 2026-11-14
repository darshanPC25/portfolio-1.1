import { motion } from 'framer-motion'
import { Fragment } from 'react'
import { EASE_SOFT, VIEWPORT_ONCE, WORD_STAGGER } from '@/utils/motion'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'

interface TextRevealProps {
  text: string
  className?: string
  /** Seconds before the first word moves. */
  delay?: number
}

/* Each word sits in a clipping mask with a little padding so italic
   overhangs and descenders are not cut off. */
const MASK = 'inline-block overflow-hidden align-bottom -mx-[0.06em] px-[0.06em] -mb-[0.14em] pb-[0.14em]'

const container = {
  hidden: {},
  visible: (delay: number) => ({ transition: { staggerChildren: WORD_STAGGER, delayChildren: delay } }),
}

const word = {
  hidden: { y: '115%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: EASE_SOFT } },
}

/**
 * Headline text whose words rise out of a mask, one after another, the first
 * time it scrolls into view. Renders plain text under reduced motion.
 */
export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  const reduceMotion = useMotionDisabled()
  if (reduceMotion) return <span className={className}>{text}</span>

  const words = text.split(' ')
  return (
    <motion.span
      className={className}
      variants={container}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
    >
      {words.map((value, index) => (
        <Fragment key={index}>
          <span className={MASK}>
            <motion.span className="inline-block" variants={word}>
              {value}
            </motion.span>
          </span>
          {index < words.length - 1 && ' '}
        </Fragment>
      ))}
    </motion.span>
  )
}

/**
 * Same word masks without motion bindings, for text animated by GSAP
 * (the hero). Each moving word is marked with `data-split-word`.
 */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((value, index) => (
        <Fragment key={index}>
          <span className={MASK}>
            <span data-split-word className="inline-block">
              {value}
            </span>
          </span>
          {index < words.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  )
}

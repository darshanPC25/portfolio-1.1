import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { SOFT_SPRING } from '@/utils/motion'

interface TiltCardProps {
  children: ReactNode
  /** Maximum tilt in degrees. */
  max?: number
  /** Corner radius utility for the light sheen, matching the card inside. */
  radius?: string
  className?: string
}

/**
 * Hover effect for project cards: the card leans toward a mouse pointer in
 * 3D and a soft light sheen follows it. Touch and pen input are ignored, and
 * the effect is off under reduced motion.
 */
export function TiltCard({ children, max = 6, radius = 'rounded-card', className }: TiltCardProps) {
  const reduceMotion = useReducedMotion()
  const rotateX = useSpring(0, SOFT_SPRING)
  const rotateY = useSpring(0, SOFT_SPRING)
  const lightX = useMotionValue(50)
  const lightY = useMotionValue(50)
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${lightX}% ${lightY}%, rgb(255 255 255 / 0.38), transparent 62%)`

  if (reduceMotion) return <div className={cn('h-full', className)}>{children}</div>

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * max * 2)
    rotateX.set(-(py - 0.5) * max * 2)
    lightX.set(px * 100)
    lightY.set(py * 100)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn('group/tilt relative h-full will-change-transform', className)}
    >
      {children}
      <motion.span
        aria-hidden="true"
        style={{ backgroundImage: sheen }}
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover/tilt:opacity-100',
          radius,
        )}
      />
    </motion.div>
  )
}

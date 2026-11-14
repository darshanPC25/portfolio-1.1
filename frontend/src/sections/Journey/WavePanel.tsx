import { motion, type MotionValue, useScroll, useTransform } from 'framer-motion'
import { type ReactNode, useRef } from 'react'
import { cn } from '@/utils/cn'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'

interface Layer {
  fill: string
  d: string
  /** Vertical travel in SVG units across the scroll range; deeper layers move less. */
  travel: number
}

const TOP_LAYERS: Layer[] = [
  {
    fill: '#8ea36a',
    travel: 18,
    d: 'M0 -40h1200v160c-90 40-170-30-270-10s-150 80-260 60-170-90-290-70S200 190 110 170 30 110 0 120z',
  },
  {
    fill: '#6f8446',
    travel: 34,
    d: 'M0 -40h1200v110c-110 30-190-30-300-20S720 130 610 110 440 40 330 60 150 140 70 120 20 80 0 90z',
  },
]

const BOTTOM_LAYERS: Layer[] = [
  {
    fill: '#566b35',
    travel: -18,
    d: 'M0 640h1200V470c-80-40-160 20-250 10s-160-70-270-50-170 90-280 70-170-60-250-40S40 500 0 480z',
  },
  {
    fill: '#3a4f25',
    travel: -30,
    d: 'M0 640h1200v-110c-100-30-180 30-290 20s-170-60-280-40-160 60-270 40S110 500 0 540z',
  },
  { fill: '#e4dbc5', travel: -40, d: 'M0 640h1200v-62c-140-26-260 14-400 6s-250-34-390-20S150 590 0 572z' },
]

function WaveLayer({ layer, progress, still }: { layer: Layer; progress: MotionValue<number>; still: boolean }) {
  const y = useTransform(progress, [0, 1], [layer.travel, -layer.travel])
  return (
    <motion.g filter="url(#wave-shadow)" style={{ y: still ? 0 : y }}>
      <path fill={layer.fill} d={layer.d} />
    </motion.g>
  )
}

/**
 * Dark forest panel with layered paper-cut waves, after the
 * "Pushing Boundaries" block in the reference. While it scrolls past, each
 * layer slides at its own speed so the cut paper reads as real depth.
 */
export function WavePanel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useMotionDisabled()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  return (
    <div ref={ref} className={cn('theme-fixed relative isolate overflow-hidden rounded-panel bg-pine shadow-lift', className)}>
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="wave-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#141d0d" floodOpacity="0.55" />
          </filter>
        </defs>
        <rect width="1200" height="600" fill="#26361a" />
        {[...TOP_LAYERS, ...BOTTOM_LAYERS].map((layer) => (
          <WaveLayer key={layer.fill} layer={layer} progress={scrollYProgress} still={reduceMotion} />
        ))}
      </svg>
      {children}
    </div>
  )
}

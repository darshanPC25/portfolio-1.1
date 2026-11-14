import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'

interface BlobProps {
  tone?: 'sage' | 'olive' | 'cream'
  /** Perfect sphere instead of an organic shape. */
  round?: boolean
  /** Gentle floating motion. */
  drift?: 'none' | 'normal' | 'slow'
  /** Positioning and size utilities, e.g. "left-[-4rem] top-10 size-56". */
  className?: string
  style?: CSSProperties
}

/**
 * Decorative sculptural shape drawn with CSS only. Used outside the hero so
 * the page keeps a single WebGL canvas.
 */
export function Blob({ tone = 'sage', round = false, drift = 'slow', className, style }: BlobProps) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        'blob block',
        `blob-${tone}`,
        round && 'blob-round',
        drift === 'normal' && 'animate-drift',
        drift === 'slow' && 'animate-drift-slow',
        className,
      )}
    />
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface TagProps {
  children: ReactNode
  tone?: 'neutral' | 'green' | 'onDark'
  className?: string
}

const tones = {
  neutral: 'bg-ivory/80 text-moss border-sand',
  green: 'bg-mist text-forest border-sage/70',
  onDark: 'bg-ivory/10 text-mist border-ivory/20',
} as const

/** Small rounded label for technologies, topics and statuses. */
export function Tag({ children, tone = 'neutral', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

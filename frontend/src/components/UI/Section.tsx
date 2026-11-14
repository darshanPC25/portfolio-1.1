import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionProps {
  id: string
  children: ReactNode
  /** Background utility for the full-width band. */
  background?: string
  className?: string
  /** Decorative layer rendered behind the content (blobs, washes). */
  decoration?: ReactNode
}

/** Full-width page band with a centred content column and consistent rhythm. */
export function Section({ id, children, background, className, decoration }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn('relative overflow-hidden', background)}>
      {decoration && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {decoration}
        </div>
      )}
      <div className={cn('relative mx-auto w-full max-w-page px-5 py-20 sm:px-8 md:py-28 lg:py-32', className)}>
        {children}
      </div>
    </section>
  )
}

import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Lifts slightly on hover. Use for cards that are interactive. */
  interactive?: boolean
  padding?: 'none' | 'md' | 'lg'
}

const paddings = {
  none: '',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const

/** Rounded clay surface used for every card on the site. */
export function Card({ children, interactive = false, padding = 'md', className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'surface-clay rounded-card',
        paddings[padding],
        interactive && 'transition-[transform,box-shadow] duration-500 ease-soft hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

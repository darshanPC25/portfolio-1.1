import { cn } from '@/utils/cn'

interface AvailabilityBadgeProps {
  available: boolean
  label: string
  className?: string
}

/** Pill with a status dot that pulses while available. */
export function AvailabilityBadge({ available, label, className }: AvailabilityBadgeProps) {
  return (
    <p
      className={cn(
        'surface-clay inline-flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 text-sm font-medium text-forest',
        className,
      )}
    >
      <span className="relative flex size-2.5" aria-hidden="true">
        {available && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-olive opacity-60" />
        )}
        <span className={cn('relative inline-flex size-2.5 rounded-full', available ? 'bg-olive' : 'bg-stone')} />
      </span>
      {label}
    </p>
  )
}

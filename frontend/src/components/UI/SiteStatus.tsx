import { RotateCw } from 'lucide-react'
import { Blob } from './Blob'

interface SiteStatusProps {
  state: 'loading' | 'error'
  onRetry?: () => void
  retrying?: boolean
  /** Loading text, e.g. "Opening Portfolio Studio…". */
  label?: string
}

/** Full-page screen shown while the portfolio loads, or if it cannot be reached. */
export function SiteStatus({ state, onRetry, retrying = false, label = 'Loading portfolio…' }: SiteStatusProps) {
  return (
    <main className="bg-hero relative flex min-h-svh items-center justify-center overflow-hidden px-5">
      <Blob tone="sage" parallax={0} className="top-[12%] left-[-4rem] size-56" />
      <Blob tone="olive" parallax={0} className="right-[-3rem] bottom-[14%] size-40" drift="normal" />

      {state === 'loading' ? (
        <div role="status" className="relative flex flex-col items-center gap-4">
          <span className="flex gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2.5 animate-pulse rounded-full bg-olive"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
          <span className="font-serif text-lg text-muted italic">{label}</span>
        </div>
      ) : (
        <div role="alert" className="relative max-w-md text-center">
          <p className="font-serif text-lg text-muted italic">/ Temporarily unavailable /</p>
          <h1 className="mt-2 text-4xl tracking-tight text-ink sm:text-5xl">The portfolio could not be loaded</h1>
          <p className="mt-4 text-lg text-muted">Please check your connection and try again in a moment.</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-b from-moss to-forest px-6 font-medium text-ivory shadow-button transition-transform duration-300 ease-soft hover:-translate-y-0.5 disabled:opacity-60"
            >
              <RotateCw size={17} aria-hidden="true" className={retrying ? 'animate-spin' : undefined} />
              {retrying ? 'Retrying…' : 'Try again'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

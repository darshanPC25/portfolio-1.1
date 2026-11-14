import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

/* ----------------------------------------------------------------- Button */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-linear-to-b from-moss to-forest text-ivory shadow-button hover:from-forest hover:to-pine',
  secondary: 'border border-sand bg-ivory text-forest hover:border-sage hover:bg-mist/60',
  ghost: 'text-forest hover:bg-forest/8',
  danger: 'border border-danger/25 bg-ivory text-danger hover:bg-danger hover:text-ivory',
}

interface StudioButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  icon?: ReactNode
  loading?: boolean
}

export function StudioButton({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: StudioButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'min-h-9 px-3.5 text-sm' : 'min-h-11 px-5 text-[0.95rem]',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}

/** Square icon-only button. `label` is required for screen readers. */
export function IconButton({
  label,
  children,
  className,
  tone = 'default',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35',
        tone === 'danger' ? 'text-danger hover:bg-danger/10' : 'text-moss hover:bg-forest/8 hover:text-pine',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* --------------------------------------------------------------- Layout */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-pretty text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-card border border-sand/70 bg-ivory p-5 shadow-soft sm:p-7', className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-xl tracking-tight text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-pretty text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatusPill({ tone, children }: { tone: 'green' | 'muted' | 'amber' | 'red'; children: ReactNode }) {
  const tones = {
    green: 'bg-mist text-forest border-sage/70',
    muted: 'bg-cream text-muted border-sand',
    amber: 'bg-[#f7ecd2] text-[#7a5a14] border-[#e7d4a6]',
    red: 'bg-[#fbeeea] text-danger border-danger/20',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}

/** Loading, error and empty states for a page or panel. */
export function LoadState({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  if (error) {
    return (
      <div role="alert" className="rounded-card border border-danger/20 bg-[#fbeeea] p-6 text-danger">
        <p>{error}</p>
        {onRetry && (
          <StudioButton size="sm" variant="danger" className="mt-4" onClick={onRetry}>
            Try again
          </StudioButton>
        )}
      </div>
    )
  }
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-muted">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      Loading…
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-stone p-8 text-center text-muted">{children}</p>
  )
}

/* -------------------------------------------------------------- Format */

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dateTime.format(date)
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

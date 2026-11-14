import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { cn } from '@/utils/cn'
import { StudioButton } from './ui'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const widths = { sm: 'w-[min(100vw-1.5rem,28rem)]', md: 'w-[min(100vw-1.5rem,40rem)]', lg: 'w-[min(100vw-1.5rem,52rem)]' }

/** Modal on the native <dialog> element: focus trap, Escape and focus return come built in. */
export function Dialog({ open, onClose, title, description, size = 'md', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={cn('modal fixed inset-0 m-auto overflow-visible bg-transparent p-0 text-ink', widths[size])}
    >
      {open && (
        <div className="max-h-[min(90svh,56rem)] overflow-y-auto overscroll-contain rounded-card bg-ivory p-6 shadow-lift sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-2xl tracking-tight text-ink">
                {title}
              </h2>
              {description && <div className="mt-1 text-sm text-pretty text-muted">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-2 rounded-full p-2 text-moss hover:bg-forest/8"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel: string
  tone?: 'danger' | 'primary'
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
  children?: ReactNode
}

/** Asks before anything destructive or public-facing. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  tone = 'danger',
  busy = false,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <div className="text-pretty text-muted">{message}</div>
      {children}
      <div className="mt-7 flex flex-wrap justify-end gap-2">
        <StudioButton onClick={onClose} disabled={busy}>
          Cancel
        </StudioButton>
        <StudioButton variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </StudioButton>
      </div>
    </Dialog>
  )
}

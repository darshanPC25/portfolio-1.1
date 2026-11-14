import { X } from 'lucide-react'
import { type MouseEvent, type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** id of the element inside the modal that titles it. */
  labelledBy: string
  children: ReactNode
  className?: string
}

/**
 * Modal built on the native <dialog> element, which provides the focus trap,
 * Escape-to-close, inert background and focus restoration.
 */
export function Modal({ open, onClose, labelledBy, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previous
    }
  }, [open])

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn(
        'modal fixed inset-0 m-auto w-[min(100vw-1.5rem,56rem)] overflow-visible bg-transparent p-0 text-ink',
        className,
      )}
    >
      <div className="relative max-h-[min(88svh,52rem)] overflow-y-auto overscroll-contain rounded-panel bg-ivory shadow-lift">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="surface-clay absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full text-forest transition-transform duration-300 ease-soft hover:rotate-90"
        >
          <X size={18} aria-hidden="true" />
        </button>
        {open && children}
      </div>
    </dialog>
  )
}

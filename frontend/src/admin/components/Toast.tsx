import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: Tone
}

interface ToastApi {
  show: (message: string, tone?: Tone) => void
}

const ToastContext = createContext<ToastApi>({ show: () => undefined })

export function useToast() {
  return useContext(ToastContext)
}

/** Small confirmations in the corner, announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), [])

  const show = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = nextId.current++
      setItems((all) => [...all.slice(-3), { id, message, tone }])
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000)
    },
    [dismiss],
  )

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5"
      >
        {items.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lift',
              toast.tone === 'error' ? 'border-danger/20 bg-[#fbeeea] text-danger' : 'border-sage/60 bg-ivory text-forest',
            )}
          >
            {toast.tone === 'error' ? (
              <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            )}
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-m-1 rounded-full p-1 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

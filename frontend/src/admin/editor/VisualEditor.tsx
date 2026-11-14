import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ThemeToggle } from '@/components/UI/ThemeToggle'
import {
  ArrowLeft,
  Eye,
  Laptop,
  MousePointerClick,
  Palette,
  Pencil,
  Smartphone,
  SquareArrowOutUpRight,
  Tablet,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage } from '../api/queries'
import { ConfirmDialog } from '../components/Dialog'
import type { FormValues } from '../components/form/fieldTypes'
import { PublishControl } from '../components/PublishControl'
import { formatDateTime, LoadState, StatusPill, StudioButton } from '../components/ui'
import { Inspector, PREVIEW_KEY } from './Inspector'
import { ManageDialog } from './ManageDialog'
import { type CanvasMessage, type EditorMessage, isFromFrame } from './messages'
import { APPEARANCE_ID, applyLiveEdit, type ManagePage, resolveTarget } from './targets'

type Device = 'desktop' | 'tablet' | 'mobile'
const DEVICE_WIDTH: Record<Device, string> = { desktop: '100%', tablet: '820px', mobile: '390px' }

type Pending = { kind: 'select'; id: string | null } | { kind: 'leave'; to: string } | null

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string; icon: LucideIcon }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-sand bg-cream/60 p-0.5">
      {options.map(({ value: v, label: optionLabel, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          title={optionLabel}
          onClick={() => onChange(v)}
          className={cn(
            'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm transition-colors',
            value === v ? 'bg-forest text-ivory shadow-button' : 'text-forest hover:bg-forest/8',
          )}
        >
          <Icon size={15} aria-hidden="true" />
          <span className="hidden xl:inline">{optionLabel}</span>
          <span className="sr-only xl:hidden">{optionLabel}</span>
        </button>
      ))}
    </div>
  )
}

/** /admin/editor — the visual website editor. */
export function VisualEditor() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const draft = useQuery({ queryKey: PREVIEW_KEY, queryFn: adminApi.preview })
  const overview = useQuery({ queryKey: adminKeys.overview, queryFn: adminApi.overview })

  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [device, setDevice] = useState<Device>('desktop')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLive] = useState<FormValues | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pending, setPending] = useState<Pending>(null)
  const [manage, setManage] = useState<ManagePage | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [frameReady, setFrameReady] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    document.title = 'Edit Website — Portfolio Studio'
  }, [])

  const target = useMemo(
    () => (draft.data && selectedId ? resolveTarget(selectedId, draft.data) : null),
    [draft.data, selectedId],
  )

  // The selected element can disappear (e.g. hidden and saved): close the panel.
  useEffect(() => {
    if (draft.data && selectedId && !target) {
      setSelectedId(null)
      setLive(null)
      setDirty(false)
    }
  }, [draft.data, selectedId, target])

  const display = useMemo(
    () => (draft.data ? applyLiveEdit(draft.data, target, dirty ? live : null) : null),
    [draft.data, target, dirty, live],
  )

  // Keep the canvas in sync with the draft, unsaved edits, mode and selection.
  useEffect(() => {
    if (!frameReady || !display) return
    const message: EditorMessage = { type: 'state', content: display, mode, selectedId }
    frame.current?.contentWindow?.postMessage(message, window.location.origin)
  }, [frameReady, display, mode, selectedId])

  const select = useCallback((id: string | null) => {
    setSelectedId(id)
    setLive(null)
    setDirty(false)
  }, [])

  const requestSelect = useCallback(
    (id: string | null) => {
      if (id === selectedId) return
      if (dirty) setPending({ kind: 'select', id })
      else select(id)
    },
    [dirty, selectedId, select],
  )

  useEffect(() => {
    const onMessage = (event: MessageEvent<CanvasMessage>) => {
      if (!isFromFrame(event, frame.current)) return
      if (event.data.type === 'ready') setFrameReady(true)
      if (event.data.type === 'select') requestSelect(event.data.id)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [requestSelect])

  const leave = (to: string) => (dirty ? setPending({ kind: 'leave', to }) : navigate(to))

  const confirmPending = () => {
    if (!pending) return
    if (pending.kind === 'select') select(pending.id)
    else navigate(pending.to)
    setPending(null)
  }

  const onLiveChange = useCallback((values: FormValues | null) => setLive(values), [])
  const onSaved = useCallback(() => {
    setSavedAt(new Date())
    setLive(null)
    queryClient.invalidateQueries({ queryKey: adminKeys.overview })
  }, [queryClient])

  const closeManage = () => {
    setManage(null)
    queryClient.invalidateQueries({ queryKey: PREVIEW_KEY })
  }

  let draftStatus: ReactNode
  if (dirty) draftStatus = <StatusPill tone="amber">Unsaved edits</StatusPill>
  else if (savedAt) draftStatus = <StatusPill tone="green">Draft saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</StatusPill>
  else draftStatus = <StatusPill tone="muted">Draft</StatusPill>

  return (
    <div className="flex h-svh flex-col bg-cream text-ink">
      {/* Toolbar */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-sand/80 bg-ivory px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => leave('/admin')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm text-forest hover:bg-forest/8"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Studio</span>
        </button>
        <div className="min-w-0">
          <h1 className="text-lg leading-tight tracking-tight text-ink">Edit Website</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted" aria-live="polite">
            {draftStatus}
            <span>Last modified {formatDateTime(overview.data?.draftLastChangedAt)}</span>
            {overview.data?.lastPublication && (
              <span className="hidden md:inline">
                · Published v{overview.data.lastPublication.version}, {formatDateTime(overview.data.lastPublication.publishedAt)}
              </span>
            )}
          </p>
        </div>

        <div className="flex-1" />

        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'edit', label: 'Edit', icon: Pencil },
            { value: 'preview', label: 'Preview', icon: Eye },
          ]}
        />
        <Segmented
          label="Device width"
          value={device}
          onChange={setDevice}
          options={[
            { value: 'desktop', label: 'Desktop', icon: Laptop },
            { value: 'tablet', label: 'Tablet', icon: Tablet },
            { value: 'mobile', label: 'Phone', icon: Smartphone },
          ]}
        />
        <ThemeToggle className="size-9" />
        <StudioButton size="sm" icon={<Palette size={16} aria-hidden="true" />} onClick={() => requestSelect(APPEARANCE_ID)}>
          <span className="hidden sm:inline">Theme</span>
          <span className="sr-only sm:hidden">Theme and appearance</span>
        </StudioButton>
        <a
          href="/admin/preview"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm text-forest hover:bg-forest/8"
        >
          <SquareArrowOutUpRight size={15} aria-hidden="true" />
          <span className="hidden lg:inline">Full preview</span>
          <span className="sr-only">(draft, opens in a new tab)</span>
        </a>
        <PublishControl />
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Canvas */}
        <div className="flex min-w-0 flex-1 justify-center overflow-auto bg-sand/45 p-2 sm:p-4">
          {draft.isError ? (
            <div className="w-full max-w-md self-center">
              <LoadState error={errorMessage(draft.error)} onRetry={() => draft.refetch()} />
            </div>
          ) : (
            <iframe
              ref={frame}
              title="Website editor canvas"
              src="/admin/editor/canvas"
              style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
              className="h-full shrink-0 rounded-xl border border-sand bg-ivory shadow-lift"
            />
          )}
        </div>

        {/* Inspector: side panel on large screens, bottom sheet on small ones */}
        <aside
          aria-label="Editing panel"
          className={cn(
            'z-30 border-sand/80 bg-ivory',
            'fixed inset-x-0 bottom-0 max-h-[65svh] rounded-t-card border-t shadow-lift',
            'lg:static lg:flex lg:max-h-none lg:w-[24rem] lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none',
            target ? 'flex flex-col' : 'hidden',
          )}
        >
          {target ? (
            <div className="flex min-h-0 w-full flex-1 flex-col">
              <Inspector
                key={target.id}
                target={target}
                onLiveChange={onLiveChange}
                onDirtyChange={setDirty}
                onSaved={onSaved}
                onClose={() => requestSelect(null)}
                onManage={setManage}
              />
            </div>
          ) : (
            <div className="hidden w-full flex-col gap-5 p-6 lg:flex">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-mist text-forest">
                <MousePointerClick size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl tracking-tight text-ink">Click anything to edit it</h2>
                <p className="mt-2 text-sm text-pretty text-muted">
                  Hover over the page: editable text, buttons, images, projects and skills get an outline. Click one to
                  edit it here. Changes preview instantly; <strong className="font-medium text-forest">Save</strong> stores
                  them in the draft, and <strong className="font-medium text-forest">Publish</strong> makes the draft live.
                </p>
              </div>
              <ol className="flex flex-col gap-2 text-sm text-muted">
                <li>1. Select an element and edit it.</li>
                <li>2. Save — it goes to the draft.</li>
                <li>3. Switch to Preview, or open the full preview.</li>
                <li>4. Publish and confirm.</li>
              </ol>
              <StudioButton icon={<Palette size={16} aria-hidden="true" />} onClick={() => requestSelect(APPEARANCE_ID)}>
                Theme &amp; appearance
              </StudioButton>
              <Link to="/admin" className="text-sm text-forest underline underline-offset-4">
                Open the studio pages instead
              </Link>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Discard unsaved changes?"
        message="You have edits that are not saved to the draft yet. They will be lost."
        confirmLabel="Discard changes"
        onConfirm={confirmPending}
        onClose={() => setPending(null)}
      />
      <ManageDialog page={manage} onClose={closeManage} />
    </div>
  )
}

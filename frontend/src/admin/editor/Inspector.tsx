import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ExternalLink, Plus, Settings2, X } from 'lucide-react'
import { type FormEvent, useCallback, useId, useState } from 'react'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import { ConfigForm } from '../components/form/ConfigForm'
import { inputClass } from '../components/form/Fields'
import type { FormValues } from '../components/form/fieldTypes'
import { FileUpload, IMAGE_HINT, IMAGE_MAX, IMAGE_TYPES } from '../components/FileUpload'
import { useToast } from '../components/Toast'
import { LoadState, StudioButton } from '../components/ui'
import { type EditTarget, type ExtraAction, type ManagePage, formToStyle, isEmptyStyle, STYLE_FIELDS, styleToForm } from './targets'

export const PREVIEW_KEY = adminKeys.resource('preview')

interface InspectorProps {
  target: EditTarget
  onLiveChange: (values: FormValues | null) => void
  onDirtyChange: (dirty: boolean) => void
  onSaved: () => void
  onClose: () => void
  onManage: (page: ManagePage) => void
}

/** Contextual editing panel for the selected element. */
export function Inspector({ target, onLiveChange, onDirtyChange, onSaved, onClose, onManage }: InspectorProps) {
  const queryClient = useQueryClient()
  const fields = target.styleable ? [...target.fields, ...STYLE_FIELDS] : target.fields

  // Always load fresh draft values for the selected element.
  const query = useQuery({
    queryKey: [...adminKeys.resource('target'), target.id],
    queryFn: async () => {
      const [values, styles] = await Promise.all([
        target.load(),
        target.styleable ? adminApi.elementStyles() : Promise.resolve({} as Record<string, never>),
      ])
      return { ...values, ...(target.styleable ? styleToForm(styles[target.id]) : {}) }
    },
    staleTime: 0,
    gcTime: 0,
  })

  const handleValues = useCallback((values: FormValues) => onLiveChange(values), [onLiveChange])

  const save = async (values: FormValues) => {
    const contentValues = Object.fromEntries(Object.entries(values).filter(([key]) => !key.startsWith('style')))
    await target.save(contentValues)
    if (target.styleable && query.data) {
      const next = formToStyle(values)
      const before = formToStyle(query.data)
      if (JSON.stringify(next) !== JSON.stringify(before)) {
        await adminApi.putElementStyle(target.id, isEmptyStyle(next) ? {} : next)
      }
    }
    await queryClient.invalidateQueries({ queryKey: PREVIEW_KEY })
    onSaved()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-sand/70 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{target.group}</p>
          <h2 className="mt-0.5 truncate text-xl tracking-tight text-ink" title={target.label}>
            {target.label}
          </h2>
          {target.hint && <p className="mt-1 text-xs text-muted">{target.hint}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close editing panel"
          className="-mr-2 rounded-full p-2 text-moss hover:bg-forest/8"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {query.isPending ? (
          <LoadState />
        ) : query.isError ? (
          <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
        ) : (
          <ConfigForm
            key={`${target.id}-${query.dataUpdatedAt}`}
            fields={fields}
            initial={query.data}
            columns={1}
            submitLabel="Save"
            discardLabel="Cancel"
            successMessage="Saved to the draft. Publish when you're ready."
            onValuesChange={handleValues}
            onDirtyChange={onDirtyChange}
            onSubmit={save}
          />
        )}

        {target.extras && target.extras.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 border-t border-sand/70 pt-5">
            {target.extras.map((extra, index) => (
              <Extra key={index} extra={extra} onManage={onManage} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Extra({ extra, onManage }: { extra: ExtraAction; onManage: (page: ManagePage) => void }) {
  switch (extra.kind) {
    case 'image':
      return <ImageExtra {...extra} />
    case 'order':
      return <OrderExtra extra={extra} />
    case 'addSkill':
      return <AddSkillExtra categoryId={extra.categoryId} />
    case 'manage':
      return (
        <StudioButton size="sm" variant="ghost" className="-ml-2 self-start" icon={<Settings2 size={16} aria-hidden="true" />} onClick={() => onManage(extra.page)}>
          {extra.label}
        </StudioButton>
      )
    case 'link':
      return (
        <a href={extra.to} className="inline-flex items-center gap-2 text-sm text-forest underline underline-offset-4">
          {extra.label} <ExternalLink size={14} aria-hidden="true" />
        </a>
      )
  }
}

function ImageExtra({
  label,
  upload,
  title = 'Image',
  hint,
  remove,
}: {
  label: string
  upload: (file: File) => Promise<unknown>
  title?: string
  hint?: string
  remove?: { label: string; run: () => Promise<unknown> }
}) {
  const toast = useToast()
  const mutation = useStudioMutation(upload, {
    invalidate: [PREVIEW_KEY],
    success: 'Image replaced in the draft.',
  })
  const removal = useStudioMutation(remove?.run ?? (() => Promise.resolve()), {
    invalidate: [PREVIEW_KEY],
    success: 'Removed from the draft.',
  })
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">{title}</p>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      <FileUpload
        label={label}
        accept={IMAGE_TYPES}
        hint={IMAGE_HINT}
        maxBytes={IMAGE_MAX}
        busy={mutation.isPending}
        onFile={(file) => mutation.mutate(file)}
        onInvalid={(message) => toast.show(message, 'error')}
      />
      {remove && (
        <StudioButton
          size="sm"
          variant="ghost"
          className="-ml-2 mt-2"
          loading={removal.isPending}
          onClick={() => removal.mutate()}
        >
          {remove.label}
        </StudioButton>
      )}
    </div>
  )
}

function OrderExtra({ extra }: { extra: Extract<ExtraAction, { kind: 'order' }> }) {
  const mutation = useStudioMutation(
    async (delta: number) => {
      const ids = await extra.ids()
      const index = ids.indexOf(extra.selfId)
      const target = index + delta
      if (index < 0 || target < 0 || target >= ids.length) return null
      ids.splice(index, 1)
      ids.splice(target, 0, extra.selfId)
      return extra.reorder(ids)
    },
    { invalidate: [PREVIEW_KEY], success: (result) => (result === null ? 'Already at the end.' : 'Order saved to the draft.') },
  )
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">{extra.label}</p>
      <div className="flex gap-2">
        <StudioButton size="sm" icon={<ArrowUp size={16} aria-hidden="true" />} disabled={mutation.isPending} onClick={() => mutation.mutate(-1)}>
          Move earlier
        </StudioButton>
        <StudioButton size="sm" icon={<ArrowDown size={16} aria-hidden="true" />} disabled={mutation.isPending} onClick={() => mutation.mutate(1)}>
          Move later
        </StudioButton>
      </div>
    </div>
  )
}

function AddSkillExtra({ categoryId }: { categoryId: string }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const mutation = useStudioMutation((value: string) => adminApi.createSkill(categoryId, { name: value, visible: true }), {
    invalidate: [PREVIEW_KEY],
    success: 'Skill added to the draft.',
    silentError: true,
    onSuccess: () => setName(''),
  })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = name.trim()
    if (!value) return setError('Enter a skill name.')
    setError(null)
    mutation.mutate(value, { onError: (e) => setError(errorMessage(e)) })
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        Add a skill to this category
      </label>
      <div className="flex gap-2">
        <input id={id} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={cn(inputClass, 'min-w-0')} />
        <StudioButton type="submit" size="sm" loading={mutation.isPending} icon={<Plus size={16} aria-hidden="true" />}>
          Add
        </StudioButton>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  )
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { cn } from '@/utils/cn'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import { ConfirmDialog, Dialog } from './Dialog'
import { ConfigForm } from './form/ConfigForm'
import type { FieldDef, FormValues } from './form/fieldTypes'
import { EmptyState, IconButton, LoadState, Panel, StatusPill, StudioButton } from './ui'

interface Item {
  id: string
  visible: boolean
  order: number
}

export interface CollectionConfig<T extends Item> {
  /** Query cache key segment, e.g. "projects". */
  resource: string
  /** "project", "entry" … used in labels. */
  noun: string
  title: string
  description?: ReactNode
  fields: FieldDef[]
  /** Values for a new item (API shape). */
  blank: FormValues
  list: () => Promise<T[]>
  create: (values: FormValues) => Promise<unknown>
  update: (id: string, values: FormValues) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  reorder: (ids: string[]) => Promise<unknown>
  /** Defaults to an update with `visible` flipped. */
  setVisible?: (id: string, visible: boolean) => Promise<unknown>
  /** Item → form values (API shape). Defaults to the item itself. */
  toForm?: (item: T) => FormValues
  summary: (item: T) => { title: string; subtitle?: string; meta?: ReactNode; thumbnail?: ReactNode }
  /** Extra content inside the edit dialog for an existing item (e.g. image upload). */
  editExtra?: (item: T) => ReactNode
  emptyText: string
}

/**
 * Full management of an ordered list: add, edit (dialog), publish/unpublish,
 * move up/down, delete with confirmation.
 */
export function CollectionManager<T extends Item>(config: CollectionConfig<T>) {
  const queryClient = useQueryClient()
  const key = adminKeys.resource(config.resource)
  const query = useQuery({ queryKey: key, queryFn: config.list })
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const toForm = config.toForm ?? ((item: T) => item as unknown as FormValues)
  const noun = config.noun

  const invalidate = [key] as const

  const reorder = useStudioMutation(config.reorder, {
    invalidate,
    success: 'Order saved to the draft.',
  })
  const visibility = useStudioMutation(
    ({ item, visible }: { item: T; visible: boolean }) =>
      config.setVisible ? config.setVisible(item.id, visible) : config.update(item.id, { ...toForm(item), visible }),
    {
      invalidate,
      success: (_) => 'Visibility saved to the draft. Publish to apply it.',
    },
  )
  const remove = useStudioMutation((item: T) => config.remove(item.id), {
    invalidate,
    success: `The ${noun} was deleted from the draft.`,
    onSuccess: () => setDeleting(null),
  })

  const items = query.data ?? []

  const move = (index: number, delta: number) => {
    const ids = items.map((item) => item.id)
    const [moved] = ids.splice(index, 1)
    ids.splice(index + delta, 0, moved)
    reorder.mutate(ids)
  }

  const current = editing && editing !== 'new' ? items.find((item) => item.id === editing.id) ?? editing : editing

  return (
    <Panel
      title={config.title}
      description={config.description}
      actions={
        <StudioButton variant="primary" size="sm" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setEditing('new')}>
          Add {noun}
        </StudioButton>
      }
    >
      {query.isPending ? (
        <LoadState />
      ) : query.isError ? (
        <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState>{config.emptyText}</EmptyState>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item, index) => {
            const summary = config.summary(item)
            return (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center',
                  item.visible ? 'border-sand/80 bg-ivory' : 'border-dashed border-stone bg-cream/40',
                )}
              >
                {summary.thumbnail}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium break-words text-ink">{summary.title}</h3>
                    {item.visible ? (
                      <StatusPill tone="green">Shown</StatusPill>
                    ) : (
                      <StatusPill tone="muted">Hidden</StatusPill>
                    )}
                    {summary.meta}
                  </div>
                  {summary.subtitle && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{summary.subtitle}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-0.5 sm:justify-end">
                  <IconButton
                    label={`Move ${summary.title} up`}
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Move ${summary.title} down`}
                    disabled={index === items.length - 1 || reorder.isPending}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={item.visible ? `Hide ${summary.title}` : `Show ${summary.title}`}
                    disabled={visibility.isPending}
                    onClick={() => visibility.mutate({ item, visible: !item.visible })}
                  >
                    {item.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </IconButton>
                  <IconButton label={`Edit ${summary.title}`} onClick={() => setEditing(item)}>
                    <Pencil size={16} aria-hidden="true" />
                  </IconButton>
                  <IconButton label={`Delete ${summary.title}`} tone="danger" onClick={() => setDeleting(item)}>
                    <Trash2 size={16} aria-hidden="true" />
                  </IconButton>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? `Add ${noun}` : `Edit ${noun}`}
        description="Changes are saved to the draft. Publish to make them live."
        size="lg"
      >
        {current && (
          <ConfigForm
            key={current === 'new' ? 'new' : current.id}
            fields={config.fields}
            initial={current === 'new' ? config.blank : toForm(current)}
            submitLabel={current === 'new' ? `Add ${noun}` : 'Save changes'}
            allowPristineSubmit={current === 'new'}
            guardNavigation={false}
            successMessage={current === 'new' ? `The ${noun} was added to the draft.` : 'Saved to the draft.'}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              const result = current === 'new' ? await config.create(values) : await config.update(current.id, values)
              await queryClient.invalidateQueries({ queryKey: key })
              setEditing(null)
              return result
            }}
          >
            {current !== 'new' && config.editExtra?.(current)}
          </ConfigForm>
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete this ${noun}?`}
        message={
          <>
            <strong className="text-ink">{deleting ? config.summary(deleting).title : ''}</strong> will be removed from the
            draft. It stays on the live site until you publish. This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        busy={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </Panel>
  )
}

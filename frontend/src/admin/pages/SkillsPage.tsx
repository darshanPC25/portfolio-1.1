import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import type { SkillCategory, SkillItem } from '../api/types'
import { ConfirmDialog, Dialog } from '../components/Dialog'
import { ConfigForm } from '../components/form/ConfigForm'
import { inputClass } from '../components/form/Fields'
import type { FieldDef } from '../components/form/fieldTypes'
import { SectionCard } from '../components/SectionCard'
import { EmptyState, IconButton, LoadState, PageHeader, Panel, StatusPill, StudioButton } from '../components/ui'

const KEY = adminKeys.resource('skills')

const ICONS = [
  { value: 'CODE', label: 'Code (languages)' },
  { value: 'SERVER', label: 'Server (backend)' },
  { value: 'DATABASE', label: 'Database (data)' },
  { value: 'NETWORK', label: 'Network (foundations)' },
  { value: 'TOOLS', label: 'Tools' },
]

const CATEGORY_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, max: 80 },
  { name: 'icon', label: 'Icon', type: 'select', required: true, options: ICONS },
  { name: 'description', label: 'Short description', type: 'text', required: true, max: 200, wide: true },
  { name: 'visible', label: 'Shown on the site', type: 'toggle' },
]

function moveIds<T extends { id: string }>(items: T[], index: number, delta: number) {
  const ids = items.map((item) => item.id)
  const [moved] = ids.splice(index, 1)
  ids.splice(index + delta, 0, moved)
  return ids
}

type Pending = { kind: 'category'; category: SkillCategory } | { kind: 'skill'; skill: SkillItem } | null

function AddSkill({ category }: { category: SkillCategory }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const id = useId()
  const add = useStudioMutation((value: string) => adminApi.createSkill(category.id, { name: value, visible: true }), {
    invalidate: [KEY],
    success: 'Skill added to the draft.',
    silentError: true,
    onSuccess: () => setName(''),
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = name.trim()
    if (!value) return setError('Enter a skill name.')
    if (value.length > 80) return setError('Keep it under 80 characters.')
    setError(null)
    add.mutate(value, { onError: (e) => setError(errorMessage(e)) })
  }

  return (
    <form onSubmit={submit} className="mt-3" noValidate>
      <label htmlFor={id} className="sr-only">
        New skill in {category.title}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Add a skill…"
          aria-invalid={Boolean(error)}
          className={cn(inputClass, 'min-w-0')}
        />
        <StudioButton type="submit" size="sm" loading={add.isPending} icon={<Plus size={16} aria-hidden="true" />}>
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

function SkillEditor({
  skill,
  categories,
  currentCategoryId,
  onClose,
}: {
  skill: SkillItem
  categories: SkillCategory[]
  currentCategoryId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const fields: FieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, max: 80, wide: true },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      required: true,
      options: categories.map((c) => ({ value: c.id, label: c.title })),
      hint: 'Moving a skill places it at the end of the new category.',
    },
    { name: 'visible', label: 'Shown on the site', type: 'toggle' },
  ]
  return (
    <ConfigForm
      fields={fields}
      initial={{ name: skill.name, categoryId: currentCategoryId, visible: skill.visible }}
      guardNavigation={false}
      successMessage="Skill saved to the draft."
      onCancel={onClose}
      onSubmit={async (values) => {
        await adminApi.updateSkill(skill.id, values as { name: string; visible: boolean; categoryId: string })
        await queryClient.invalidateQueries({ queryKey: KEY })
        onClose()
      }}
    />
  )
}

export function SkillsPage() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: KEY, queryFn: adminApi.skillCategories })
  const [editingCategory, setEditingCategory] = useState<SkillCategory | 'new' | null>(null)
  const [editingSkill, setEditingSkill] = useState<{ skill: SkillItem; categoryId: string } | null>(null)
  const [deleting, setDeleting] = useState<Pending>(null)

  const invalidate = [KEY] as const
  const reorderCategories = useStudioMutation(adminApi.reorderSkillCategories, { invalidate, success: 'Order saved.' })
  const reorderSkills = useStudioMutation(
    ({ categoryId, ids }: { categoryId: string; ids: string[] }) => adminApi.reorderSkills(categoryId, ids),
    { invalidate, success: 'Order saved.' },
  )
  const toggleCategory = useStudioMutation(
    (c: SkillCategory) =>
      adminApi.updateSkillCategory(c.id, { title: c.title, icon: c.icon, description: c.description, visible: !c.visible }),
    { invalidate, success: 'Visibility saved to the draft.' },
  )
  const toggleSkill = useStudioMutation(
    ({ skill, categoryId }: { skill: SkillItem; categoryId: string }) =>
      adminApi.updateSkill(skill.id, { name: skill.name, visible: !skill.visible, categoryId }),
    { invalidate, success: 'Visibility saved to the draft.' },
  )
  const remove = useStudioMutation(
    (pending: NonNullable<Pending>) =>
      pending.kind === 'category' ? adminApi.deleteSkillCategory(pending.category.id) : adminApi.deleteSkill(pending.skill.id),
    { invalidate, success: 'Deleted from the draft.', onSuccess: () => setDeleting(null) },
  )

  const categories = query.data ?? []

  return (
    <>
      <PageHeader title="Skills" description="Group skills into categories, then order them as they should appear." />
      <div className="flex flex-col gap-6">
        <Panel
          title="Categories"
          actions={
            <StudioButton
              variant="primary"
              size="sm"
              icon={<Plus size={16} aria-hidden="true" />}
              onClick={() => setEditingCategory('new')}
            >
              Add category
            </StudioButton>
          }
        >
          {query.isPending ? (
            <LoadState />
          ) : query.isError ? (
            <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
          ) : categories.length === 0 ? (
            <EmptyState>No categories yet. Add one to start listing skills.</EmptyState>
          ) : (
            <ol className="grid gap-4 lg:grid-cols-2">
              {categories.map((category, index) => (
                <li
                  key={category.id}
                  className={cn(
                    'min-w-0 rounded-2xl border p-4',
                    category.visible ? 'border-sand/80 bg-ivory' : 'border-dashed border-stone bg-cream/40',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg text-ink">{category.title}</h3>
                        {!category.visible && <StatusPill tone="muted">Hidden</StatusPill>}
                      </div>
                      <p className="text-sm text-muted">{category.description}</p>
                    </div>
                    <div className="flex">
                      <IconButton
                        label={`Move ${category.title} up`}
                        disabled={index === 0}
                        onClick={() => reorderCategories.mutate(moveIds(categories, index, -1))}
                      >
                        <ArrowUp size={16} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`Move ${category.title} down`}
                        disabled={index === categories.length - 1}
                        onClick={() => reorderCategories.mutate(moveIds(categories, index, 1))}
                      >
                        <ArrowDown size={16} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={category.visible ? `Hide ${category.title}` : `Show ${category.title}`}
                        onClick={() => toggleCategory.mutate(category)}
                      >
                        {category.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      </IconButton>
                      <IconButton label={`Edit ${category.title}`} onClick={() => setEditingCategory(category)}>
                        <Pencil size={16} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`Delete ${category.title}`}
                        tone="danger"
                        onClick={() => setDeleting({ kind: 'category', category })}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-col divide-y divide-sand/60 rounded-xl border border-sand/60 bg-cream/30">
                    {category.skills.length === 0 && <li className="px-3 py-2.5 text-sm text-muted">No skills yet.</li>}
                    {category.skills.map((skill, skillIndex) => (
                      <li key={skill.id} className="flex items-center gap-1 py-1 pr-1 pl-3">
                        <span className={cn('flex-1 text-sm', skill.visible ? 'text-ink' : 'text-muted line-through')}>
                          {skill.name}
                          {!skill.visible && <span className="sr-only"> (hidden)</span>}
                        </span>
                        <IconButton
                          label={`Move ${skill.name} up`}
                          disabled={skillIndex === 0}
                          onClick={() =>
                            reorderSkills.mutate({ categoryId: category.id, ids: moveIds(category.skills, skillIndex, -1) })
                          }
                        >
                          <ArrowUp size={15} aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Move ${skill.name} down`}
                          disabled={skillIndex === category.skills.length - 1}
                          onClick={() =>
                            reorderSkills.mutate({ categoryId: category.id, ids: moveIds(category.skills, skillIndex, 1) })
                          }
                        >
                          <ArrowDown size={15} aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={skill.visible ? `Hide ${skill.name}` : `Show ${skill.name}`}
                          onClick={() => toggleSkill.mutate({ skill, categoryId: category.id })}
                        >
                          {skill.visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                        </IconButton>
                        <IconButton
                          label={`Edit ${skill.name}`}
                          onClick={() => setEditingSkill({ skill, categoryId: category.id })}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${skill.name}`}
                          tone="danger"
                          onClick={() => setDeleting({ kind: 'skill', skill })}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                  <AddSkill category={category} />
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <SectionCard sectionKey="SKILLS" title="Section heading" />
      </div>

      <Dialog
        open={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        title={editingCategory === 'new' ? 'Add category' : 'Edit category'}
      >
        {editingCategory && (
          <ConfigForm
            fields={CATEGORY_FIELDS}
            initial={
              editingCategory === 'new'
                ? { title: '', icon: 'CODE', description: '', visible: true }
                : { ...editingCategory }
            }
            allowPristineSubmit={editingCategory === 'new'}
            guardNavigation={false}
            submitLabel={editingCategory === 'new' ? 'Add category' : 'Save changes'}
            successMessage="Category saved to the draft."
            onCancel={() => setEditingCategory(null)}
            onSubmit={async (values) => {
              if (editingCategory === 'new') await adminApi.createSkillCategory(values)
              else await adminApi.updateSkillCategory(editingCategory.id, values)
              await queryClient.invalidateQueries({ queryKey: KEY })
              setEditingCategory(null)
            }}
          />
        )}
      </Dialog>

      <Dialog open={editingSkill !== null} onClose={() => setEditingSkill(null)} title="Edit skill" size="sm">
        {editingSkill && (
          <SkillEditor
            skill={editingSkill.skill}
            currentCategoryId={editingSkill.categoryId}
            categories={categories}
            onClose={() => setEditingSkill(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={deleting?.kind === 'category' ? 'Delete this category?' : 'Delete this skill?'}
        message={
          deleting?.kind === 'category'
            ? `“${deleting.category.title}” and all ${deleting.category.skills.length} of its skills will be removed from the draft. This cannot be undone.`
            : `“${deleting?.kind === 'skill' ? deleting.skill.name : ''}” will be removed from the draft. This cannot be undone.`
        }
        confirmLabel="Delete"
        busy={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}

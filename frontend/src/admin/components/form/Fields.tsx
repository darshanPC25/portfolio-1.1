import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useId } from 'react'
import {
  Controller,
  type FieldErrors,
  type FieldValues,
  get,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { cn } from '@/utils/cn'
import { IconButton, StudioButton } from '../ui'
import type { FieldDef, GroupFieldDef, ListFieldDef, SimpleFieldDef } from './fieldTypes'

export const inputClass =
  'w-full rounded-xl border border-sand bg-ivory px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/60 ' +
  'transition-[border-color,box-shadow] focus:border-olive focus:shadow-[0_0_0_3px_rgb(111_132_70/0.18)] focus:outline-none ' +
  'aria-[invalid=true]:border-danger'

function errorAt(errors: FieldErrors<FieldValues>, path: string): string | undefined {
  const error = get(errors, path) as { message?: string; root?: { message?: string } } | undefined
  return error?.message ?? error?.root?.message
}

function Hint({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="mt-1.5 text-xs text-muted">
      {text}
    </p>
  ) : null
}

function ErrorText({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} role="alert" className="mt-1.5 text-sm text-danger">
      {text}
    </p>
  ) : null
}

/** One simple field at `path` (top level or inside a group row). */
export function SimpleField({ field, path, compact = false }: { field: SimpleFieldDef; path: string; compact?: boolean }) {
  const { register, control, formState } = useFormContext()
  const id = useId()
  const error = errorAt(formState.errors, path)
  const describedBy = [error ? `${id}-error` : null, field.hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  const required = 'required' in field && field.required

  if (field.type === 'toggle') {
    return (
      <Controller
        control={control}
        name={path}
        render={({ field: rhf }) => (
          <div className="flex items-start gap-3">
            <button
              id={id}
              type="button"
              role="switch"
              aria-checked={Boolean(rhf.value)}
              aria-describedby={describedBy}
              onClick={() => rhf.onChange(!rhf.value)}
              className={cn(
                'relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
                rhf.value ? 'border-moss bg-moss' : 'border-stone bg-sand',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-[1.15rem] rounded-full bg-ivory shadow-soft transition-transform duration-200',
                  rhf.value ? 'translate-x-[1.3rem]' : 'translate-x-0.5',
                )}
              />
            </button>
            <label htmlFor={id} className="cursor-pointer">
              <span className="block text-sm font-medium text-forest">{field.label}</span>
              {field.hint && (
                <span id={`${id}-hint`} className="block text-xs text-muted">
                  {field.hint}
                </span>
              )}
            </label>
          </div>
        )}
      />
    )
  }

  const common = {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: inputClass,
  }

  let control_: React.ReactNode
  if (field.type === 'select') {
    control_ = (
      <select {...common} {...register(path)}>
        {!required && <option value="">—</option>}
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  } else if (field.type === 'textarea') {
    control_ = <textarea rows={field.rows ?? 4} placeholder={field.placeholder} {...common} {...register(path)} />
  } else if (field.type === 'color') {
    control_ = (
      <Controller
        control={control}
        name={path}
        render={({ field: rhf }) => (
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label={`${field.label} picker`}
              value={/^#[0-9a-f]{6}$/i.test(rhf.value) ? rhf.value : '#6f8446'}
              onChange={(event) => rhf.onChange(event.target.value)}
              className="h-11 w-14 cursor-pointer rounded-xl border border-sand bg-ivory p-1"
            />
            <input {...common} value={rhf.value ?? ''} onChange={rhf.onChange} onBlur={rhf.onBlur} spellCheck={false} />
          </div>
        )}
      />
    )
  } else {
    const inputType = { email: 'email', url: 'url', date: 'date', password: 'password' }[field.type as string] ?? 'text'
    control_ = (
      <input
        type={inputType}
        autoComplete={field.type === 'password' ? 'current-password' : undefined}
        placeholder={field.placeholder}
        spellCheck={field.type === 'text'}
        {...common}
        {...register(path)}
      />
    )
  }

  return (
    <div>
      <label htmlFor={id} className={cn('mb-1.5 block text-sm font-medium text-forest', compact && 'text-xs')}>
        {field.label}
        {!required && field.type !== 'select' && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {control_}
      <ErrorText id={`${id}-error`} text={error} />
      <Hint id={`${id}-hint`} text={field.hint} />
    </div>
  )
}

function RowControls({
  index,
  count,
  move,
  remove,
  itemLabel,
}: {
  index: number
  count: number
  move: (from: number, to: number) => void
  remove: (index: number) => void
  itemLabel: string
}) {
  return (
    <div className="flex shrink-0">
      <IconButton label={`Move ${itemLabel} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
        <ArrowUp size={16} aria-hidden="true" />
      </IconButton>
      <IconButton
        label={`Move ${itemLabel} ${index + 1} down`}
        disabled={index === count - 1}
        onClick={() => move(index, index + 1)}
      >
        <ArrowDown size={16} aria-hidden="true" />
      </IconButton>
      <IconButton label={`Remove ${itemLabel} ${index + 1}`} tone="danger" onClick={() => remove(index)}>
        <Trash2 size={16} aria-hidden="true" />
      </IconButton>
    </div>
  )
}

function ListField({ field }: { field: ListFieldDef }) {
  const { control, register, formState } = useFormContext()
  const { fields, append, remove, move } = useFieldArray({ control, name: field.name })
  const rootError = errorAt(formState.errors, field.name)
  const full = field.maxItems != null && fields.length >= field.maxItems

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-forest">{field.label}</legend>
      {field.hint && <p className="mb-2 text-xs text-muted">{field.hint}</p>}
      <ol className="flex flex-col gap-2">
        {fields.map((row, index) => {
          const path = `${field.name}.${index}.value`
          const error = errorAt(formState.errors, path)
          const props = {
            'aria-label': `${field.itemLabel} ${index + 1}`,
            'aria-invalid': Boolean(error),
            className: inputClass,
            ...register(path),
          }
          return (
            <li key={row.id}>
              <div className="flex items-start gap-1">
                {field.multiline ? <textarea rows={3} {...props} /> : <input type="text" {...props} />}
                <RowControls index={index} count={fields.length} move={move} remove={remove} itemLabel={field.itemLabel} />
              </div>
              {error && <p className="mt-1 text-sm text-danger">{error}</p>}
            </li>
          )
        })}
      </ol>
      {rootError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {rootError}
        </p>
      )}
      <StudioButton
        size="sm"
        variant="ghost"
        className="mt-2 -ml-2"
        icon={<Plus size={16} aria-hidden="true" />}
        disabled={full}
        onClick={() => append({ value: '' })}
      >
        Add {field.itemLabel.toLowerCase()}
      </StudioButton>
    </fieldset>
  )
}

function GroupField({ field }: { field: GroupFieldDef }) {
  const { control, formState } = useFormContext()
  const { fields, append, remove, move } = useFieldArray({ control, name: field.name })
  const rootError = errorAt(formState.errors, field.name)
  const full = field.maxItems != null && fields.length >= field.maxItems
  const blank = Object.fromEntries(field.fields.map((f) => [f.name, f.type === 'toggle' ? false : '']))

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-forest">{field.label}</legend>
      {field.hint && <p className="mb-2 text-xs text-muted">{field.hint}</p>}
      <ol className="flex flex-col gap-3">
        {fields.map((row, index) => (
          <li key={row.id} className="rounded-2xl border border-sand/80 bg-cream/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-muted uppercase">
                {field.itemLabel} {index + 1}
              </span>
              <RowControls index={index} count={fields.length} move={move} remove={remove} itemLabel={field.itemLabel} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {field.fields.map((sub) => (
                <div key={sub.name} className={cn(sub.wide && 'sm:col-span-2')}>
                  <SimpleField field={sub} path={`${field.name}.${index}.${sub.name}`} compact />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {rootError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {rootError}
        </p>
      )}
      <StudioButton
        size="sm"
        variant="ghost"
        className="mt-2 -ml-2"
        icon={<Plus size={16} aria-hidden="true" />}
        disabled={full}
        onClick={() => append(blank)}
      >
        Add {field.itemLabel.toLowerCase()}
      </StudioButton>
    </fieldset>
  )
}

/** Lays out every field in a responsive two-column grid. */
export function FieldGrid({ fields }: { fields: FieldDef[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map((field) => {
        const wide = field.wide || field.type === 'list' || field.type === 'group' || field.type === 'textarea'
        return (
          <div key={field.name} className={cn(wide && 'md:col-span-2')}>
            {field.type === 'list' ? (
              <ListField field={field} />
            ) : field.type === 'group' ? (
              <GroupField field={field} />
            ) : (
              <SimpleField field={field} path={field.name} />
            )}
          </div>
        )
      })}
    </div>
  )
}

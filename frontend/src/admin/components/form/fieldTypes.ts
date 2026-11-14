import { z } from '@/utils/zod'

/**
 * Declarative form fields. A page describes its fields once; the form engine
 * renders them, builds the client-side validation, and converts values to and
 * from the API shape.
 */

interface Base {
  name: string
  label: string
  hint?: string
  /** Full width in the two-column grid. */
  wide?: boolean
}

export interface TextFieldDef extends Base {
  type: 'text' | 'email' | 'url' | 'href' | 'slug' | 'textarea' | 'date' | 'color' | 'password'
  required?: boolean
  max?: number
  placeholder?: string
  rows?: number
}

export interface SelectFieldDef extends Base {
  type: 'select'
  options: { value: string; label: string }[]
  required?: boolean
}

export interface ToggleFieldDef extends Base {
  type: 'toggle'
}

export type SimpleFieldDef = TextFieldDef | SelectFieldDef | ToggleFieldDef

/** A list of short texts (focus areas, tags, highlights, paragraphs). */
export interface ListFieldDef extends Base {
  type: 'list'
  itemLabel: string
  max?: number
  maxItems?: number
  minItems?: number
  multiline?: boolean
}

/** A list of small records (About facts, approach steps). */
export interface GroupFieldDef extends Base {
  type: 'group'
  itemLabel: string
  fields: SimpleFieldDef[]
  maxItems?: number
  minItems?: number
}

/** A subheading inside a form (no value). */
export interface HeadingDef extends Base {
  type: 'heading'
}

export type FieldDef = SimpleFieldDef | ListFieldDef | GroupFieldDef | HeadingDef

export type FormValues = Record<string, unknown>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WEB_URL = /^https?:\/\/[^\s/$.?#][^\s]*$/i
const HREF = /^(#[A-Za-z0-9_-]+|\/\S*|https?:\/\/\S+|mailto:[^\s@]+@[^\s@]+)$/
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const HEX = /^#[0-9a-fA-F]{6}$/

function simpleSchema(field: SimpleFieldDef): z.ZodType {
  if (field.type === 'toggle') return z.boolean()
  if (field.type === 'select') {
    return field.required ? z.string().min(1, `Choose ${field.label.toLowerCase()}.`) : z.string()
  }

  let text = z.string().trim()
  if (field.max) text = text.max(field.max, `Keep this under ${field.max} characters.`)
  if (field.required) text = text.min(1, `${field.label} is required.`)

  const optional = (test: RegExp, message: string) =>
    text.refine((value) => value === '' || test.test(value), message)

  switch (field.type) {
    case 'email':
      return optional(EMAIL, 'Enter a valid email address.')
    case 'url':
      return optional(WEB_URL, 'Enter a full web address starting with https://.')
    case 'href':
      return optional(HREF, 'Use a section (#projects), a path (/page), a web address or a mailto: link.')
    case 'slug':
      return optional(SLUG, 'Use lowercase letters, numbers and dashes.')
    case 'color':
      return optional(HEX, 'Use a colour like #6f8446.')
    case 'date':
      return optional(/^\d{4}-\d{2}-\d{2}$/, 'Enter a date.')
    default:
      return text
  }
}

function countLimits<T extends z.ZodArray<z.ZodType>>(schema: T, min?: number, max?: number, noun = 'items') {
  let s = schema
  if (max != null) s = s.max(max, `Use at most ${max} ${noun}.`) as T
  if (min != null && min > 0) s = s.min(min, `Add at least ${min} ${min === 1 ? noun.replace(/s$/, '') : noun}.`) as T
  return s
}

export function buildSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of fields) {
    if (field.type === 'heading') continue
    if (field.type === 'list') {
      let item = z.string().trim().min(1, 'Fill this in or remove it.')
      if (field.max) item = item.max(field.max, `Keep this under ${field.max} characters.`)
      shape[field.name] = countLimits(z.array(z.object({ value: item })), field.minItems, field.maxItems)
    } else if (field.type === 'group') {
      const inner: Record<string, z.ZodType> = {}
      for (const sub of field.fields) inner[sub.name] = simpleSchema(sub)
      shape[field.name] = countLimits(z.array(z.object(inner)), field.minItems, field.maxItems)
    } else {
      shape[field.name] = simpleSchema(field)
    }
  }
  return z.object(shape)
}

const isText = (f: SimpleFieldDef): f is TextFieldDef | SelectFieldDef => f.type !== 'toggle'

function simpleToForm(field: SimpleFieldDef, value: unknown) {
  if (field.type === 'toggle') return Boolean(value)
  return value == null ? '' : String(value)
}

function simpleFromForm(field: SimpleFieldDef, value: unknown) {
  if (field.type === 'toggle') return Boolean(value)
  const text = typeof value === 'string' ? value.trim() : ''
  // Optional fields go back to the API as null when empty.
  return text === '' && isText(field) && !('required' in field && field.required) ? null : text
}

/** API object → form values (lists become {value} rows, nulls become ''). */
export function toFormValues(fields: FieldDef[], source: FormValues): FormValues {
  const values: FormValues = {}
  for (const field of fields) {
    if (field.type === 'heading') continue
    const raw = source[field.name]
    if (field.type === 'list') {
      values[field.name] = ((raw as string[] | null) ?? []).map((value) => ({ value }))
    } else if (field.type === 'group') {
      values[field.name] = ((raw as FormValues[] | null) ?? []).map((item) =>
        Object.fromEntries(field.fields.map((sub) => [sub.name, simpleToForm(sub, item[sub.name])])),
      )
    } else {
      values[field.name] = simpleToForm(field, raw)
    }
  }
  return values
}

/** Form values → API object. */
export function fromFormValues(fields: FieldDef[], values: FormValues): FormValues {
  const result: FormValues = {}
  for (const field of fields) {
    if (field.type === 'heading') continue
    const raw = values[field.name]
    if (field.type === 'list') {
      result[field.name] = ((raw as { value: string }[]) ?? []).map((row) => row.value.trim())
    } else if (field.type === 'group') {
      result[field.name] = ((raw as FormValues[]) ?? []).map((item) =>
        Object.fromEntries(field.fields.map((sub) => [sub.name, simpleFromForm(sub, item[sub.name])])),
      )
    } else {
      result[field.name] = simpleFromForm(field, raw)
    }
  }
  return result
}

/**
 * Maps a server field path ("focusAreas[1]", "facts[0].label") to the form
 * path used by react-hook-form ("focusAreas.1.value", "facts.0.label").
 */
export function serverPathToFormPath(fields: FieldDef[], path: string): string | null {
  const dotted = path.replace(/\[(\d+)\]/g, '.$1')
  const root = dotted.split('.')[0]
  const field = fields.find((f) => f.name === root)
  if (!field) return null
  if (field.type === 'list' && /^[^.]+\.\d+$/.test(dotted)) return `${dotted}.value`
  return dotted
}

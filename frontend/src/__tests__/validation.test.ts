import { describe, expect, it } from 'vitest'
import { buildSchema, fromFormValues, toFormValues, type FieldDef } from '@/admin/components/form/fieldTypes'
import { contactMessageSchema } from '@/services/contactService'

describe('contact form schema (mirrors the backend ContactRequest rules)', () => {
  const valid = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    subject: 'Hello',
    message: 'I would like to talk about a backend role.',
    website: '',
  }

  it('accepts a complete message and trims whitespace', () => {
    const parsed = contactMessageSchema.parse({ ...valid, name: '  Ada Lovelace  ' })
    expect(parsed.name).toBe('Ada Lovelace')
  })

  it.each([
    ['name', 'A'],
    ['email', 'not-an-email'],
    ['subject', 'Hi'],
    ['message', 'Too short'],
    ['message', 'x'.repeat(2001)],
  ])('rejects an invalid %s', (field, value) => {
    const result = contactMessageSchema.safeParse({ ...valid, [field]: value })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual([field])
  })
})

describe('studio form engine', () => {
  const fields: FieldDef[] = [
    { name: 'title', label: 'Title', type: 'text', required: true, max: 20 },
    { name: 'repoUrl', label: 'Repository', type: 'url' },
    { name: 'link', label: 'Link', type: 'href' },
    { name: 'slug', label: 'Slug', type: 'slug' },
    { name: 'accent', label: 'Accent', type: 'color' },
    { name: 'visible', label: 'Visible', type: 'toggle' },
    { name: 'tags', label: 'Tags', type: 'list', itemLabel: 'Tag', maxItems: 2 },
  ]
  const schema = buildSchema(fields)
  const base = { title: 'Ok', repoUrl: '', link: '', slug: '', accent: '', visible: true, tags: [] }

  it('accepts empty optional fields', () => {
    expect(schema.safeParse(base).success).toBe(true)
  })

  it.each([
    ['title', ''],
    ['title', 'x'.repeat(21)],
    ['repoUrl', 'javascript:alert(1)'],
    ['repoUrl', 'ftp://example.com'],
    ['link', 'javascript:alert(1)'],
    ['slug', 'Not A Slug'],
    ['accent', 'green'],
  ])('rejects %s = %j', (field, value) => {
    expect(schema.safeParse({ ...base, [field]: value }).success).toBe(false)
  })

  it('accepts safe links', () => {
    for (const link of ['#projects', '/admin/login', 'https://github.com', 'mailto:me@example.com']) {
      expect(schema.safeParse({ ...base, link }).success).toBe(true)
    }
  })

  it('limits list length', () => {
    const tags = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]
    expect(schema.safeParse({ ...base, tags }).success).toBe(false)
  })

  it('round-trips API values and sends empty optional text as null', () => {
    const api = { title: 'Ok', repoUrl: null, link: '#about', slug: null, accent: null, visible: false, tags: ['Java'] }
    const form = toFormValues(fields, api)
    expect(form.repoUrl).toBe('')
    expect(form.tags).toEqual([{ value: 'Java' }])
    expect(fromFormValues(fields, form)).toEqual(api)
  })
})

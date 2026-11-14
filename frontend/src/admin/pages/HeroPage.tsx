import { adminApi } from '../api/adminApi'
import type { FieldDef } from '../components/form/fieldTypes'
import { SingletonForm } from '../components/SingletonForm'
import { PageHeader } from '../components/ui'

const FIELDS: FieldDef[] = [
  { name: 'greeting', label: 'Greeting', type: 'text', required: true, max: 120, placeholder: "Hi, I'm Darshan" },
  { name: 'role', label: 'Role', type: 'text', required: true, max: 120, placeholder: 'Software Developer' },
  { name: 'tagline', label: 'Tagline', type: 'textarea', required: true, max: 300, rows: 2 },
  { name: 'primaryCtaLabel', label: 'Main button label', type: 'text', required: true, max: 60 },
  {
    name: 'primaryCtaHref',
    label: 'Main button destination',
    type: 'href',
    required: true,
    max: 500,
    hint: 'A section like #contact, a path, or a full web address.',
  },
  { name: 'secondaryCtaLabel', label: 'Second button label', type: 'text', required: true, max: 60 },
  { name: 'secondaryCtaHref', label: 'Second button destination', type: 'href', required: true, max: 500 },
  {
    name: 'resumeLabel',
    label: 'Resume link label',
    type: 'text',
    required: true,
    max: 60,
    hint: 'The link appears once a resume is uploaded.',
  },
  { name: 'focusLabel', label: 'Focus strip label', type: 'text', required: true, max: 60 },
  {
    name: 'focusAreas',
    label: 'Focus areas',
    type: 'list',
    itemLabel: 'Focus area',
    max: 120,
    maxItems: 12,
    hint: 'Shown as a row under the hero, in this order.',
  },
]

export function HeroPage() {
  return (
    <>
      <PageHeader title="Hero" description="The first screen visitors see." />
      <SingletonForm resource="hero" title="Hero content" fields={FIELDS} load={adminApi.hero} save={adminApi.updateHero} />
    </>
  )
}

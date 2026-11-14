import { adminApi } from '../api/adminApi'
import type { FieldDef } from '../components/form/fieldTypes'
import { SectionCard } from '../components/SectionCard'
import { SingletonForm } from '../components/SingletonForm'
import { PageHeader } from '../components/ui'

const FIELDS: FieldDef[] = [
  {
    name: 'paragraphs',
    label: 'Paragraphs',
    type: 'list',
    itemLabel: 'Paragraph',
    multiline: true,
    max: 2000,
    minItems: 1,
    maxItems: 6,
    hint: 'The first paragraph is shown larger.',
  },
  {
    name: 'facts',
    label: 'Quick facts',
    type: 'group',
    itemLabel: 'Fact',
    maxItems: 8,
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true, max: 60 },
      { name: 'value', label: 'Value', type: 'text', required: true, max: 120 },
    ],
  },
  { name: 'approachHeading', label: '"How I work" heading', type: 'text', required: true, max: 120, wide: true },
  {
    name: 'approach',
    label: '"How I work" steps',
    type: 'group',
    itemLabel: 'Step',
    maxItems: 6,
    fields: [
      { name: 'step', label: 'Number', type: 'text', required: true, max: 10 },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 80 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, max: 300, rows: 2, wide: true },
    ],
  },
]

export function AboutPage() {
  return (
    <>
      <PageHeader title="About" description="Your introduction, quick facts and how you work." />
      <div className="flex flex-col gap-6">
        <SectionCard sectionKey="ABOUT" title="Section heading" />
        <SingletonForm resource="about" title="About content" fields={FIELDS} load={adminApi.about} save={adminApi.updateAbout} />
      </div>
    </>
  )
}

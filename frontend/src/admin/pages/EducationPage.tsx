import { adminApi } from '../api/adminApi'
import type { Education } from '../api/types'
import { CollectionManager } from '../components/CollectionManager'
import type { FieldDef } from '../components/form/fieldTypes'
import { SectionCard } from '../components/SectionCard'
import { PageHeader } from '../components/ui'

const FIELDS: FieldDef[] = [
  { name: 'degree', label: 'Degree', type: 'text', required: true, max: 160, wide: true },
  { name: 'field', label: 'Field of study', type: 'text', required: true, max: 200, wide: true },
  { name: 'institution', label: 'Institution', type: 'text', max: 200 },
  { name: 'period', label: 'Period label', type: 'text', required: true, max: 60, placeholder: 'Graduating 2026' },
  { name: 'description', label: 'Description', type: 'textarea', required: true, max: 2000, rows: 4 },
  { name: 'visible', label: 'Shown on the site', type: 'toggle' },
]

const BLANK = { degree: '', field: '', institution: '', period: '', description: '', visible: true }

export function EducationPage() {
  return (
    <>
      <PageHeader title="Education" description="Degrees and studies." />
      <div className="flex flex-col gap-6">
        <CollectionManager<Education>
          resource="education"
          noun="entry"
          title="Education entries"
          fields={FIELDS}
          blank={BLANK}
          list={adminApi.education}
          create={adminApi.createEducation}
          update={adminApi.updateEducation}
          remove={adminApi.deleteEducation}
          reorder={adminApi.reorderEducation}
          toForm={(entry) => ({ ...entry })}
          summary={(entry) => ({
            title: entry.degree,
            subtitle: [entry.field, entry.institution, entry.period].filter(Boolean).join(' · '),
          })}
          emptyText="No education entries yet."
        />
        <SectionCard sectionKey="EDUCATION" title="Section heading" />
      </div>
    </>
  )
}

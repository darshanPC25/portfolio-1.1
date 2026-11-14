import { adminApi } from '../api/adminApi'
import type { Experience } from '../api/types'
import { CollectionManager } from '../components/CollectionManager'
import type { FieldDef } from '../components/form/fieldTypes'
import { SectionCard } from '../components/SectionCard'
import { PageHeader } from '../components/ui'

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Role or title', type: 'text', required: true, max: 160, wide: true },
  { name: 'organisation', label: 'Organisation', type: 'text', max: 160 },
  { name: 'period', label: 'Period label', type: 'text', required: true, max: 40, placeholder: '2025 – Now' },
  { name: 'startDate', label: 'Start date', type: 'date', hint: 'Optional, for your records.' },
  { name: 'endDate', label: 'End date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea', required: true, max: 2000, rows: 4 },
  { name: 'visible', label: 'Shown on the site', type: 'toggle' },
]

const BLANK = { title: '', organisation: '', period: '', startDate: '', endDate: '', description: '', visible: true }

export function ExperiencePage() {
  return (
    <>
      <PageHeader
        title="Experience"
        description="Entries in the Professional Journey section. Only add roles you have actually held."
      />
      <div className="flex flex-col gap-6">
        <CollectionManager<Experience>
          resource="experience"
          noun="entry"
          title="Journey entries"
          fields={FIELDS}
          blank={BLANK}
          list={adminApi.experience}
          create={adminApi.createExperience}
          update={adminApi.updateExperience}
          remove={adminApi.deleteExperience}
          reorder={adminApi.reorderExperience}
          toForm={(entry) => ({ ...entry })}
          summary={(entry) => ({
            title: entry.title,
            subtitle: [entry.period, entry.organisation].filter(Boolean).join(' · '),
          })}
          emptyText="No entries yet."
        />
        <SectionCard sectionKey="JOURNEY" title="Section heading" />
      </div>
    </>
  )
}

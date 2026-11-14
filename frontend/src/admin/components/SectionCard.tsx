import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage } from '../api/queries'
import type { Section, SectionKey } from '../api/types'
import { ConfigForm } from './form/ConfigForm'
import type { FieldDef } from './form/fieldTypes'
import { LoadState, Panel, StatusPill } from './ui'

const SETTING_LABELS: Record<string, { label: string; max: number }> = {
  emptyMessage: { label: 'Message when no GitHub username is set', max: 500 },
  formHeading: { label: 'Form heading', max: 500 },
  submitLabel: { label: 'Send button label', max: 500 },
}

function fieldsFor(section: Section): FieldDef[] {
  return [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text', required: true, max: 80, hint: 'Small italic line above the heading.' },
    { name: 'navLabel', label: 'Menu label', type: 'text', required: true, max: 40 },
    { name: 'heading', label: 'Heading', type: 'text', required: true, max: 160, wide: true },
    { name: 'intro', label: 'Introduction', type: 'textarea', max: 500, rows: 3 },
    ...section.allowedSettings.map(
      (key): FieldDef => ({
        name: `setting_${key}`,
        label: SETTING_LABELS[key]?.label ?? key,
        type: 'text',
        required: true,
        max: SETTING_LABELS[key]?.max ?? 500,
      }),
    ),
    {
      name: 'visible',
      label: 'Show this section on the site',
      type: 'toggle',
      hint: 'Hidden sections disappear from the page and the menu after you publish.',
      wide: true,
    },
  ]
}

/** Heading, menu label, intro and visibility of one page section. */
export function SectionCard({ sectionKey, title }: { sectionKey: SectionKey; title: string }) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: adminKeys.resource('sections'), queryFn: adminApi.sections })
  const section = query.data?.find((s) => s.key === sectionKey)

  return (
    <Panel
      title={title}
      description="The heading and introduction shown at the top of this section."
      actions={section && (section.visible ? <StatusPill tone="green">Shown</StatusPill> : <StatusPill tone="muted">Hidden</StatusPill>)}
    >
      {query.isPending ? (
        <LoadState />
      ) : !section ? (
        <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <ConfigForm
          key={`${section.key}-${section.heading}-${section.visible}`}
          fields={fieldsFor(section)}
          initial={{
            ...section,
            ...Object.fromEntries(section.allowedSettings.map((k) => [`setting_${k}`, section.settings[k] ?? ''])),
          }}
          onSubmit={async (values) => {
            const settings = Object.fromEntries(
              section.allowedSettings.map((k) => [k, (values[`setting_${k}`] as string | null) ?? '']),
            )
            await adminApi.updateSection(section.key, {
              navLabel: values.navLabel,
              eyebrow: values.eyebrow,
              heading: values.heading,
              intro: values.intro,
              visible: values.visible,
              settings,
            })
            await queryClient.invalidateQueries({ queryKey: adminKeys.resource('sections') })
          }}
        />
      )}
    </Panel>
  )
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import type { SectionKey } from '../api/types'
import type { FieldDef } from '../components/form/fieldTypes'
import { SingletonForm } from '../components/SingletonForm'
import { IconButton, LoadState, PageHeader, Panel, StatusPill } from '../components/ui'

const FIELDS: FieldDef[] = [
  {
    name: 'accentColor',
    label: 'Accent colour',
    type: 'color',
    required: true,
    hint: 'Used for the hero greeting, contact heading and small highlights. Palette-friendly: #6f8446 olive (default), #566b35 moss, #3a4f25 forest, #7d8f5a sage-olive.',
    wide: true,
  },
  {
    name: 'backgroundStyle',
    label: 'Background tone',
    type: 'select',
    required: true,
    options: [
      { value: 'IVORY', label: 'Ivory (default)' },
      { value: 'CREAM', label: 'Warm cream' },
      { value: 'MIST', label: 'Sage mist' },
    ],
  },
  {
    name: 'headingFont',
    label: 'Heading typeface',
    type: 'select',
    required: true,
    options: [
      { value: 'SANS', label: 'Modern sans (Outfit)' },
      { value: 'SERIF', label: 'Editorial serif (Instrument Serif)' },
    ],
  },
  {
    name: 'heroSceneEnabled',
    label: '3D hero scene',
    type: 'toggle',
    hint: 'Off: the hero shows still, flat shapes instead of the WebGL scene.',
  },
  {
    name: 'motionEnabled',
    label: 'Animations',
    type: 'toggle',
    hint: 'Off: no entrance, scroll or hover animation for anyone. Visitors who prefer reduced motion never see it either way.',
  },
]

function SectionOrder() {
  const queryClient = useQueryClient()
  const key = adminKeys.resource('sections')
  const query = useQuery({ queryKey: key, queryFn: adminApi.sections })
  const reorder = useStudioMutation(adminApi.reorderSections, {
    success: 'Section order saved to the draft.',
    onSuccess: (sections) => queryClient.setQueryData(key, sections),
  })
  const sections = query.data ?? []

  const move = (index: number, delta: number) => {
    const keys: SectionKey[] = sections.map((s) => s.key)
    const [moved] = keys.splice(index, 1)
    keys.splice(index + delta, 0, moved)
    reorder.mutate(keys)
  }

  return (
    <Panel
      title="Page sections"
      description="Order of the sections on the page and in the menu. Show or hide a section from its own page."
    >
      {query.isPending ? (
        <LoadState />
      ) : query.isError ? (
        <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <ol className="flex flex-col gap-2">
          {sections.map((section, index) => (
            <li key={section.key} className="flex items-center gap-3 rounded-xl border border-sand/80 px-4 py-2">
              <span className="w-6 text-sm text-muted">{index + 1}</span>
              <span className="flex-1 text-ink">{section.navLabel}</span>
              {section.visible ? <StatusPill tone="green">Shown</StatusPill> : <StatusPill tone="muted">Hidden</StatusPill>}
              <IconButton
                label={`Move ${section.navLabel} up`}
                disabled={index === 0 || reorder.isPending}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} aria-hidden="true" />
              </IconButton>
              <IconButton
                label={`Move ${section.navLabel} down`}
                disabled={index === sections.length - 1 || reorder.isPending}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

export function AppearancePage() {
  return (
    <>
      <PageHeader
        title="Appearance"
        description="Colours, typography, background and animation. Choices stay within the sage and cream design."
      />
      <div className="flex flex-col gap-6">
        <SingletonForm
          resource="appearance"
          title="Look and feel"
          fields={FIELDS}
          load={adminApi.appearance}
          save={adminApi.updateAppearance}
        />
        <SectionOrder />
      </div>
    </>
  )
}

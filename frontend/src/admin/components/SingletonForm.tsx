import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { adminKeys, errorMessage } from '../api/queries'
import { ConfigForm } from './form/ConfigForm'
import type { FieldDef, FormValues } from './form/fieldTypes'
import { LoadState, Panel } from './ui'

interface SingletonFormProps<T> {
  resource: string
  title: string
  description?: ReactNode
  fields: FieldDef[]
  load: () => Promise<T>
  save: (values: FormValues) => Promise<T>
  /** Converts the loaded record into form values (API shape). */
  toForm?: (data: T) => FormValues
  /** Converts saved form values before sending (API shape). */
  fromForm?: (values: FormValues, data: T) => FormValues
}

/** Load → edit → save for a single record (Hero, About, Appearance, SEO …). */
export function SingletonForm<T extends { updatedAt?: string | null }>({
  resource,
  title,
  description,
  fields,
  load,
  save,
  toForm,
  fromForm,
}: SingletonFormProps<T>) {
  const queryClient = useQueryClient()
  const key = adminKeys.resource(resource)
  const query = useQuery({ queryKey: key, queryFn: load })

  return (
    <Panel title={title} description={description}>
      {query.isPending ? (
        <LoadState />
      ) : query.isError ? (
        <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <ConfigForm
          key={query.data.updatedAt ?? 'loaded'}
          fields={fields}
          initial={toForm ? toForm(query.data) : (query.data as unknown as FormValues)}
          onSubmit={async (values) => {
            const saved = await save(fromForm ? fromForm(values, query.data) : values)
            queryClient.setQueryData(key, saved)
          }}
        />
      )}
    </Panel>
  )
}

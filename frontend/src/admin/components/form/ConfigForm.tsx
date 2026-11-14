import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { getApiProblem } from '@/services/apiClient'
import { cn } from '@/utils/cn'
import { adminKeys, errorMessage } from '../../api/queries'
import { useToast } from '../Toast'
import { StudioButton } from '../ui'
import { buildSchema, type FieldDef, type FormValues, fromFormValues, serverPathToFormPath, toFormValues } from './fieldTypes'
import { FieldGrid } from './Fields'

interface ConfigFormProps {
  fields: FieldDef[]
  /** Current values in API shape. */
  initial: FormValues
  /** Receives values in API shape; throw (reject) to show errors. */
  onSubmit: (values: FormValues) => Promise<unknown>
  submitLabel?: string
  /** Toast after saving; null for none. */
  successMessage?: string | null
  /** In dialogs: closes the dialog. On pages Cancel discards unsaved edits. */
  onCancel?: () => void
  /** Allow saving an untouched form (e.g. creating a new item with defaults). */
  allowPristineSubmit?: boolean
  /** Extra content under the fields (e.g. an image uploader). */
  children?: ReactNode
  /** Warn before leaving the page with unsaved edits. */
  guardNavigation?: boolean
}

/**
 * Generic studio form: validation (client and server), unsaved-changes
 * indicator, Save / Cancel. Server field errors appear next to their fields.
 */
export function ConfigForm({
  fields,
  initial,
  onSubmit,
  submitLabel = 'Save changes',
  successMessage = 'Saved to the draft. Publish to make it live.',
  onCancel,
  allowPristineSubmit = false,
  children,
  guardNavigation = true,
}: ConfigFormProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const schema = useMemo(() => buildSchema(fields), [fields])
  const defaults = useMemo(() => toFormValues(fields, initial), [fields, initial])

  const form = useForm<FormValues>({ resolver: zodResolver(schema) as never, defaultValues: defaults })
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting, errors },
  } = form

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty || !guardNavigation) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty, guardNavigation])

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(fromFormValues(fields, values))
      reset(values)
      queryClient.invalidateQueries({ queryKey: adminKeys.overview })
      if (successMessage) toast.show(successMessage)
    } catch (error) {
      const fieldErrors = getApiProblem(error)?.errors ?? {}
      let mapped = false
      for (const [path, message] of Object.entries(fieldErrors)) {
        const formPath = serverPathToFormPath(fields, path)
        if (formPath) {
          setError(formPath, { type: 'server', message })
          mapped = true
        }
      }
      setError('root', { type: 'server', message: mapped ? 'Please correct the highlighted fields.' : errorMessage(error) })
    }
  })

  const canSubmit = isDirty || allowPristineSubmit

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={submit}>
        <FieldGrid fields={fields} />
        {children}

        <div
          className={cn(
            'mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-sand/70 pt-5',
            !onCancel && 'sticky bottom-0 -mx-5 bg-ivory/95 px-5 pb-1 backdrop-blur sm:-mx-7 sm:px-7',
          )}
        >
          <p aria-live="polite" className="text-sm">
            {errors.root?.message ? (
              <span className="text-danger">{errors.root.message}</span>
            ) : isDirty ? (
              <span className="inline-flex items-center gap-2 text-[#7a5a14]">
                <span className="size-2 rounded-full bg-[#c99a2e]" aria-hidden="true" />
                Unsaved changes
              </span>
            ) : (
              !allowPristineSubmit && <span className="text-muted">No unsaved changes</span>
            )}
          </p>
          <div className="flex gap-2">
            {(onCancel || isDirty) && (
              <StudioButton onClick={() => (onCancel ? onCancel() : reset(defaults))} disabled={isSubmitting}>
                {onCancel ? 'Cancel' : 'Discard changes'}
              </StudioButton>
            )}
            <StudioButton type="submit" variant="primary" loading={isSubmitting} disabled={!canSubmit}>
              {submitLabel}
            </StudioButton>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

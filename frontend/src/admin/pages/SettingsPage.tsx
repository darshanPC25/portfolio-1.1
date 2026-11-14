import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from '@/utils/zod'
import { getApiProblem } from '@/services/apiClient'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage } from '../api/queries'
import type { AdminSession } from '../api/types'
import { ConfigForm } from '../components/form/ConfigForm'
import { inputClass } from '../components/form/Fields'
import type { FieldDef } from '../components/form/fieldTypes'
import { useToast } from '../components/Toast'
import { formatDateTime, PageHeader, Panel, StudioButton } from '../components/ui'

const ACCOUNT_FIELDS: FieldDef[] = [
  { name: 'displayName', label: 'Display name', type: 'text', required: true, max: 80 },
  { name: 'email', label: 'Sign-in email', type: 'email', required: true, max: 254 },
  {
    name: 'currentPassword',
    label: 'Current password',
    type: 'password',
    required: true,
    max: 128,
    hint: 'Required to confirm these changes.',
    wide: true,
  },
]

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(12, 'Use at least 12 characters.').max(64, 'Use at most 64 characters.'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'The passwords do not match.' })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from the current one.',
  })

type PasswordValues = z.infer<typeof passwordSchema>

function PasswordInput({
  label,
  autoComplete,
  error,
  registration,
}: {
  label: string
  autoComplete: string
  error?: string
  registration: ReturnType<ReturnType<typeof useForm<PasswordValues>>['register']>
}) {
  const id = useId()
  const [shown, setShown] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClass, 'pr-12')}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={shown}
          className="absolute inset-y-0 right-1 my-auto flex size-10 items-center justify-center rounded-full text-moss hover:bg-forest/8"
        >
          {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function PasswordForm() {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await adminApi.changePassword({ currentPassword, newPassword })
      reset()
      toast.show('Password changed.')
    } catch (error) {
      const fieldErrors = getApiProblem(error)?.errors ?? {}
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field === 'currentPassword' || field === 'newPassword') setError(field, { message })
      }
      if (Object.keys(fieldErrors).length === 0) toast.show(errorMessage(error), 'error')
    }
  })

  return (
    <form noValidate onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          registration={register('currentPassword')}
        />
      </div>
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        registration={register('newPassword')}
      />
      <PasswordInput
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword')}
      />
      <p className="text-xs text-muted md:col-span-2">12 to 64 characters. A long passphrase is easiest to remember.</p>
      <div className="md:col-span-2">
        <StudioButton type="submit" variant="primary" loading={isSubmitting}>
          Change password
        </StudioButton>
      </div>
    </form>
  )
}

export function SettingsPage({ session }: { session: AdminSession }) {
  const queryClient = useQueryClient()

  return (
    <>
      <PageHeader title="Settings" description="Your administrator account." />
      <div className="flex flex-col gap-6">
        <Panel title="Account" description={`Last sign-in: ${formatDateTime(session.lastLoginAt)}`}>
          <ConfigForm
            key={`${session.email}-${session.displayName}`}
            fields={ACCOUNT_FIELDS}
            initial={{ displayName: session.displayName, email: session.email, currentPassword: '' }}
            successMessage="Account updated."
            onSubmit={async (values) => {
              const updated = await adminApi.updateAccount(
                values as { displayName: string; email: string; currentPassword: string },
              )
              queryClient.setQueryData(adminKeys.session, updated)
            }}
          />
        </Panel>
        <Panel title="Password">
          <PasswordForm />
        </Panel>
      </div>
    </>
  )
}

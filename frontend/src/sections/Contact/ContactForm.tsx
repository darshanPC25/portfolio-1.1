import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Send } from 'lucide-react'
import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Buttons/Button'
import { getApiProblem } from '@/services/apiClient'
import { type ContactMessage, contactMessageSchema, sendContactMessage } from '@/services/contactService'
import { cn } from '@/utils/cn'
import { useEditables } from '@/editor/editable'

const fieldClasses =
  'w-full rounded-2xl border bg-ivory/80 px-4 py-3 text-base text-ink placeholder:text-muted/70 ' +
  'transition-[border-color,box-shadow] duration-300 focus:border-olive focus:shadow-[0_0_0_4px_rgb(111_132_70/0.18)] focus:outline-none'

interface FieldShellProps {
  label: string
  error?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; className: string }) => React.ReactNode
}

function Field({ label, error, children }: FieldShellProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
        className: cn(fieldClasses, error ? 'border-danger' : 'border-sand'),
      })}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

const FIELDS = ['name', 'email', 'subject', 'message'] as const
type Field = (typeof FIELDS)[number]

type InputProps = InputHTMLAttributes<HTMLInputElement>
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function ContactForm({ heading, submitLabel }: { heading: string; submitLabel: string }) {
  const edit = useEditables()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: '', email: '', subject: '', message: '', website: '' },
  })

  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => reset(),
    onError: (error) => {
      // Show the server's validation messages next to the matching fields.
      const fieldErrors = getApiProblem(error)?.errors ?? {}
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (FIELDS.includes(field as Field)) setError(field as Field, { type: 'server', message })
      }
    },
  })

  const problem = mutation.isError ? getApiProblem(mutation.error) : null
  const failureMessage =
    problem?.status === 429
      ? "You've sent a few messages in a short time. Please try again in a few minutes."
      : problem?.status === 400
        ? 'Please check the highlighted fields.'
        : 'Your message could not be sent right now. Nothing was lost — please try again in a moment.'

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="surface-clay relative flex flex-col gap-5 rounded-panel p-6 text-left sm:p-9"
    >
      <h3 {...edit('contact.formHeading')} className="text-2xl tracking-tight text-ink">
        {heading}
      </h3>

      {/* Anti-spam trap: hidden from people and assistive technology; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          {(props) => <input type="text" autoComplete="name" {...(props as InputProps)} {...register('name')} />}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {(props) => (
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              {...(props as InputProps)}
              {...register('email')}
            />
          )}
        </Field>
      </div>

      <Field label="Subject" error={errors.subject?.message}>
        {(props) => <input type="text" {...(props as InputProps)} {...register('subject')} />}
      </Field>

      <Field label="Message" error={errors.message?.message}>
        {(props) => (
          <textarea
            rows={5}
            {...(props as TextareaProps)}
            className={cn(props.className, 'resize-y')}
            {...register('message')}
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button {...edit('contact.submitLabel')} type="submit" size="lg" disabled={mutation.isPending} icon={<Send size={17} />}>
          {mutation.isPending ? 'Sending…' : submitLabel}
        </Button>

        <div role="status" aria-live="polite" className="min-w-0 flex-1 text-sm">
          {mutation.isSuccess && (
            <p className="flex items-center gap-2 text-forest">
              <CheckCircle2 size={18} aria-hidden="true" />
              Thank you — your message has been sent.
            </p>
          )}
          {mutation.isError && <p className="text-danger">{failureMessage}</p>}
        </div>
      </div>
    </form>
  )
}

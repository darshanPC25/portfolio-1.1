import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Blob } from '@/components/UI/Blob'
import { getApiProblem } from '@/services/apiClient'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys } from '../api/queries'
import { inputClass } from '../components/form/Fields'
import { StudioButton } from '../components/ui'

const schema = z.object({
  email: z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

type Credentials = z.infer<typeof schema>

/** Only same-studio paths are allowed as a post-login destination. */
function safeNext(next: string | null): string {
  return next && next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin'
}

function failureMessage(error: unknown): string {
  const problem = getApiProblem(error)
  if (!problem) return 'The server could not be reached. Please try again in a moment.'
  if (problem.status === 401) return 'Invalid email or password.'
  if (problem.status === 429) {
    const minutes = Math.max(1, Math.ceil((problem.retryAfterSeconds ?? 60) / 60))
    return `Too many sign-in attempts. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`
  }
  return problem.detail ?? 'Sign-in failed. Please try again.'
}

/** /admin/login — private sign-in for Portfolio Studio. There is no registration. */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const ids = { email: useId(), password: useId(), error: useId() }
  const next = safeNext(params.get('next'))
  const notice = params.get('expired')
    ? 'Your session ended. Please sign in again.'
    : (location.state as { signedOut?: boolean } | null)?.signedOut
      ? 'You have signed out.'
      : null

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  useEffect(() => {
    document.title = 'Sign in — Portfolio Studio'
    setFocus('email')
  }, [setFocus])

  // Already signed in? Go straight to the studio.
  useEffect(() => {
    let active = true
    adminApi
      .me()
      .then((session) => {
        if (!active) return
        queryClient.setQueryData(adminKeys.session, session)
        navigate(next, { replace: true })
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [navigate, next, queryClient])

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFailure(null)
    try {
      const session = await adminApi.login(email, password)
      queryClient.setQueryData(adminKeys.session, session)
      navigate(next, { replace: true })
    } catch (error) {
      setFailure(failureMessage(error))
      setFocus('password')
    }
  })

  return (
    <main className="bg-hero relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12">
      <Blob tone="sage" parallax={0} className="top-[8%] left-[-5rem] size-64 md:size-80" />
      <Blob tone="olive" parallax={0} drift="normal" className="right-[-4rem] bottom-[10%] size-48 md:size-64" />
      <Blob tone="cream" round parallax={0} drift="normal" className="top-[18%] right-[14%] size-12" />

      <div className="relative w-full max-w-md">
        <div className="surface-glass rounded-panel p-7 sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-linear-to-b from-moss to-forest text-ivory shadow-button">
              <LockKeyhole size={20} aria-hidden="true" />
            </span>
            <p className="font-serif text-lg text-muted italic">Portfolio Studio</p>
            <h1 className="mt-1 text-3xl tracking-tight text-ink">Sign in</h1>
          </div>

          {notice && !failure && (
            <p role="status" className="mb-5 rounded-2xl bg-mist px-4 py-3 text-sm text-forest">
              {notice}
            </p>
          )}
          {failure && (
            <p id={ids.error} role="alert" className="mb-5 rounded-2xl bg-[#fbeeea] px-4 py-3 text-sm text-danger">
              {failure}
            </p>
          )}

          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-describedby={failure ? ids.error : undefined}>
            <div>
              <label htmlFor={ids.email} className="mb-1.5 block text-sm font-medium text-forest">
                Email
              </label>
              <input
                id={ids.email}
                type="email"
                autoComplete="username"
                inputMode="email"
                spellCheck={false}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${ids.email}-error` : undefined}
                className={inputClass}
                {...register('email')}
              />
              {errors.email && (
                <p id={`${ids.email}-error`} className="mt-1.5 text-sm text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={ids.password} className="mb-1.5 block text-sm font-medium text-forest">
                Password
              </label>
              <div className="relative">
                <input
                  id={ids.password}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? `${ids.password}-error` : undefined}
                  className={cn(inputClass, 'pr-12')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  aria-controls={ids.password}
                  className="absolute inset-y-0 right-1 my-auto flex size-10 items-center justify-center rounded-full text-moss hover:bg-forest/8"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id={`${ids.password}-error`} className="mt-1.5 text-sm text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            <StudioButton type="submit" variant="primary" loading={isSubmitting} className="mt-1 w-full">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </StudioButton>
          </form>
        </div>

        <Link
          to="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm text-forest hover:bg-forest/8"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to the portfolio
        </Link>
      </div>
    </main>
  )
}

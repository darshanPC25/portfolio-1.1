import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiProblem } from '@/services/apiClient'
import { useToast } from '../components/Toast'

/** Query keys. Everything lives under ['admin'] so sign-out can clear it in one go. */
export const adminKeys = {
  all: ['admin'] as const,
  session: ['admin', 'session'] as const,
  overview: ['admin', 'overview'] as const,
  publications: ['admin', 'publications'] as const,
  resource: (name: string) => ['admin', name] as const,
}

/** A readable message for any failed request. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const problem = getApiProblem(error)
  if (!problem) return 'The studio could not reach the server. Check that the backend is running.'
  if (problem.status === 413) return problem.detail ?? 'The file is too large.'
  return problem.detail ?? fallback
}

/**
 * A studio write: shows a toast, refreshes the overview (unpublished-changes
 * indicator) and any listed queries.
 */
export function useStudioMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options: {
    success?: string | ((result: TResult) => string)
    invalidate?: readonly (readonly string[])[]
    onSuccess?: (result: TResult, args: TArgs) => void
    /** Leave error display to the caller (forms show field errors). */
    silentError?: boolean
  } = {},
) {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn,
    onSuccess: (result, args) => {
      options.onSuccess?.(result, args)
      for (const key of options.invalidate ?? []) queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview })
      if (options.success) {
        toast.show(typeof options.success === 'function' ? options.success(result) : options.success)
      }
    },
    onError: (error) => {
      if (!options.silentError) toast.show(errorMessage(error), 'error')
    },
  })
}

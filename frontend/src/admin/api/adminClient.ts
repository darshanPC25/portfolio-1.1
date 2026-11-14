import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/services/apiClient'

/**
 * HTTP client for the Portfolio Studio API (`/api/v1/admin`).
 *
 * - Sends the session cookie (`withCredentials`).
 * - Adds the CSRF token to every state-changing request, fetching one first
 *   if needed, and retries once with a fresh token if the server says it is stale.
 * - Announces an expired session with the `admin:unauthorized` window event.
 */
export const adminClient = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  withCredentials: true,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
})

export const CSRF_HEADER = 'X-CSRF-TOKEN'
export const UNAUTHORIZED_EVENT = 'admin:unauthorized'

let csrfToken: string | null = null

export function setCsrfToken(token: string | null) {
  csrfToken = token
}

export async function refreshCsrfToken(): Promise<string> {
  const { data } = await axios.get<{ token: string }>(`${API_BASE_URL}/admin/auth/csrf`, {
    withCredentials: true,
  })
  csrfToken = data.token
  return data.token
}

const SAFE_METHODS = new Set(['get', 'head', 'options'])

adminClient.interceptors.request.use(async (config) => {
  if (!SAFE_METHODS.has((config.method ?? 'get').toLowerCase())) {
    config.headers.set(CSRF_HEADER, csrfToken ?? (await refreshCsrfToken()))
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _csrfRetried?: boolean }

adminClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string }>) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status === 403 && error.response?.data?.code === 'csrf' && config && !config._csrfRetried) {
      config._csrfRetried = true
      config.headers.set(CSRF_HEADER, await refreshCsrfToken())
      return adminClient(config)
    }

    const url = config?.url ?? ''
    if (status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw error
  },
)

import axios, { isAxiosError } from 'axios'

/** Base URL of the portfolio REST API, including the version prefix. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

/** Origin of the API server, used to resolve files the backend serves. */
export const API_ORIGIN = new URL(
  API_BASE_URL,
  typeof window === 'undefined' ? 'http://localhost' : window.location.href,
).origin

/** The single HTTP client every service uses. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

/** RFC 9457 problem body returned by the backend for errors. */
export interface ApiProblem {
  status: number
  title?: string
  detail?: string
  /** Field name → message, for validation errors. */
  errors?: Record<string, string>
  retryAfterSeconds?: number
}

/** The backend's problem body, if `error` is an HTTP error response that carries one. */
export function getApiProblem(error: unknown): ApiProblem | null {
  if (!isAxiosError(error) || !error.response) return null
  const data = error.response.data as Partial<ApiProblem> | undefined
  return { ...data, status: error.response.status }
}

/**
 * Makes a media URL usable from the browser. Files stored by the backend are
 * returned as paths under /api/…, which live on the API origin rather than
 * the site origin.
 */
export function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null
  return url.startsWith('/api/') ? `${API_ORIGIN}${url}` : url
}

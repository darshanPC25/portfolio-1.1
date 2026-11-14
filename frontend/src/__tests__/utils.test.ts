import { describe, expect, it } from 'vitest'
import { styleToCss } from '@/editor/editable'
import { getApiProblem, resolveMediaUrl } from '@/services/apiClient'
import { formatMonthYear, isExternalHref } from '@/utils/format'

describe('format helpers', () => {
  it('formats ISO dates as month and year', () => {
    expect(formatMonthYear('2026-03-04T10:00:00Z')).toBe('Mar 2026')
    expect(formatMonthYear('not a date')).toBe('')
  })

  it('recognises links that leave the site', () => {
    expect(isExternalHref('https://github.com')).toBe(true)
    expect(isExternalHref('mailto:me@example.com')).toBe(true)
    expect(isExternalHref('#projects')).toBe(false)
    expect(isExternalHref('/admin/login')).toBe(false)
  })
})

describe('API client helpers', () => {
  it('resolves backend file paths against the API origin and leaves other URLs alone', () => {
    expect(resolveMediaUrl(null)).toBeNull()
    expect(resolveMediaUrl('/api/v1/assets/abc')).toMatch(/^https?:\/\/[^/]+\/api\/v1\/assets\/abc$/)
    expect(resolveMediaUrl('/images/profile-placeholder.svg')).toBe('/images/profile-placeholder.svg')
    expect(resolveMediaUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
  })

  it('reads RFC 9457 problem bodies only from HTTP errors', () => {
    expect(getApiProblem(new Error('network'))).toBeNull()
    const axiosLike = {
      isAxiosError: true,
      response: { status: 400, data: { title: 'Validation failed', errors: { email: 'Invalid' } } },
    }
    expect(getApiProblem(axiosLike)).toEqual({ status: 400, title: 'Validation failed', errors: { email: 'Invalid' } })
  })
})

describe('visual editor formatting', () => {
  it('turns element formatting into inline CSS', () => {
    expect(styleToCss(null)).toBeUndefined()
    expect(styleToCss({ fontScale: 1 } as never)).toBeUndefined()
    expect(styleToCss({ color: '#3a4f25', fontFamily: 'serif', fontScale: 1.25, textAlign: 'center' } as never)).toEqual({
      color: '#3a4f25',
      fontFamily: 'var(--font-serif)',
      zoom: 1.25,
      textAlign: 'center',
    })
  })
})

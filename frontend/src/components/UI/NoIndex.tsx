import { type ReactNode, useEffect } from 'react'
import { setMeta } from './SeoHead'

/**
 * Keeps private pages (sign-in, Portfolio Studio) out of search results.
 * robots.txt also disallows /admin. Pages set their own titles.
 */
export function NoIndex({ children }: { children: ReactNode }) {
  useEffect(() => {
    setMeta('name', 'robots', 'noindex, nofollow')
    return () => setMeta('name', 'robots', null)
  }, [])

  return children
}

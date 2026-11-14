import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect } from 'react'
import { SiteStatus } from '@/components/UI/SiteStatus'
import { fetchPortfolioContent } from '@/services/contentService'
import { ContentContext } from './contentContextValue'

export const PORTFOLIO_CONTENT_QUERY_KEY = ['portfolio-content'] as const

/** Page background tones offered in Appearance settings. */
const BACKGROUNDS: Record<string, string> = {
  ivory: '#f8f5ec',
  cream: '#f3ecdc',
  mist: '#eef2e4',
}

/**
 * Loads the published portfolio from the backend and supplies it to the
 * whole tree. Sections never fetch on their own, so the source can later be
 * swapped for a draft inside the visual editor without touching them.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: PORTFOLIO_CONTENT_QUERY_KEY,
    queryFn: fetchPortfolioContent,
    staleTime: 60 * 1000,
    retry: 2,
  })

  // Appearance settings: motion switch (honoured by CSS animations too), accent
  // colour, background tone and heading typeface, applied as design tokens.
  const appearance = data?.appearance
  const motionEnabled = appearance?.motionEnabled ?? true
  const accent = appearance?.accentColor
  const background = appearance?.backgroundStyle
  const headingFont = appearance?.headingFont
  useEffect(() => {
    const root = document.documentElement
    root.toggleAttribute('data-reduce-motion', !motionEnabled)
    if (accent && /^#[0-9a-f]{6}$/i.test(accent)) root.style.setProperty('--color-olive', accent)
    if (background && BACKGROUNDS[background]) root.style.setProperty('--color-ivory', BACKGROUNDS[background])
    if (headingFont === 'serif') root.style.setProperty('--font-heading', 'var(--font-serif)')
    return () => {
      root.removeAttribute('data-reduce-motion')
      root.style.removeProperty('--color-olive')
      root.style.removeProperty('--color-ivory')
      root.style.removeProperty('--font-heading')
    }
  }, [motionEnabled, accent, background, headingFont])

  if (isPending) return <SiteStatus state="loading" />
  if (isError) return <SiteStatus state="error" onRetry={() => refetch()} retrying={isRefetching} />

  return <ContentContext.Provider value={data}>{children}</ContentContext.Provider>
}

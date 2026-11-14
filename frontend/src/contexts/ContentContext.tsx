import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { SiteStatus } from '@/components/UI/SiteStatus'
import { useApplyAppearance } from '@/hooks/useApplyAppearance'
import { fetchPortfolioContent } from '@/services/contentService'
import { ContentContext } from './contentContextValue'

export const PORTFOLIO_CONTENT_QUERY_KEY = ['portfolio-content'] as const

/**
 * Loads the published portfolio from the backend and supplies it to the
 * whole tree. Sections never fetch on their own, so the visual editor can
 * render the same components from draft content instead.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: PORTFOLIO_CONTENT_QUERY_KEY,
    queryFn: fetchPortfolioContent,
    staleTime: 60 * 1000,
    retry: 2,
  })

  useApplyAppearance(data?.appearance)

  if (isPending) return <SiteStatus state="loading" />
  if (isError) return <SiteStatus state="error" onRetry={() => refetch()} retrying={isRefetching} />

  return <ContentContext.Provider value={data}>{children}</ContentContext.Provider>
}

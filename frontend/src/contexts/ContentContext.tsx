import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode } from 'react'
import { defaultContent } from '@/data/defaultContent'
import { fetchPortfolioContent } from '@/services/contentService'
import type { PortfolioContent } from '@/types/content'

export const ContentContext = createContext<PortfolioContent>(defaultContent)

export const PORTFOLIO_CONTENT_QUERY_KEY = ['portfolio-content'] as const

/**
 * Supplies portfolio content to the whole tree. Sections never import the
 * data file directly, so the source can change (bundled data today, the
 * backend later, a draft inside the visual editor after that) without
 * touching them.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: PORTFOLIO_CONTENT_QUERY_KEY,
    queryFn: fetchPortfolioContent,
    initialData: defaultContent,
    staleTime: 5 * 60 * 1000,
  })

  return <ContentContext.Provider value={data}>{children}</ContentContext.Provider>
}

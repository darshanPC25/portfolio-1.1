import { useContext } from 'react'
import { ContentContext } from '@/contexts/contentContextValue'
import type { PortfolioContent } from '@/types/content'

/** Published portfolio content. Only usable inside ContentProvider. */
export function usePortfolioContent(): PortfolioContent {
  const content = useContext(ContentContext)
  if (!content) throw new Error('usePortfolioContent must be used inside ContentProvider')
  return content
}

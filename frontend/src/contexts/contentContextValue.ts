import { createContext } from 'react'
import type { PortfolioContent } from '@/types/content'

/**
 * Published content for the tree below ContentProvider. null outside the
 * provider (e.g. the 404 page). Kept in its own module so hooks can read it
 * without importing the provider component.
 */
export const ContentContext = createContext<PortfolioContent | null>(null)

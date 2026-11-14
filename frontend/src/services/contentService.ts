import { defaultContent } from '@/data/defaultContent'
import type { PortfolioContent } from '@/types/content'

/**
 * Returns the content the public site renders.
 *
 * The backend does not exist yet, so this resolves the bundled initial
 * content. When the published-content endpoint is added, only this function
 * changes; every component already reads content through it.
 */
export async function fetchPortfolioContent(): Promise<PortfolioContent> {
  return defaultContent
}

import { useContext } from 'react'
import { ContentContext } from '@/contexts/ContentContext'

export function usePortfolioContent() {
  return useContext(ContentContext)
}

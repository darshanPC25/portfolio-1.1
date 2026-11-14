import { SeoHead } from '@/components/UI/SeoHead'
import { PortfolioPage } from './PortfolioPage'

/** Public home page: the published portfolio plus its SEO tags. */
export default function Home() {
  return (
    <>
      <SeoHead />
      <PortfolioPage />
    </>
  )
}

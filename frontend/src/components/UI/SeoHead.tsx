import { useEffect } from 'react'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'

export function setMeta(attribute: 'name' | 'property', key: string, value: string | null) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!value) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = value
}

function setCanonical(url: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!url) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}

/** Applies the published SEO settings to the document head. Renders nothing. */
export function SeoHead() {
  const { seo } = usePortfolioContent()

  useEffect(() => {
    document.title = seo.title
    setMeta('name', 'description', seo.description)
    setMeta('name', 'robots', seo.allowIndexing ? null : 'noindex, nofollow')
    setMeta('property', 'og:title', seo.title)
    setMeta('property', 'og:description', seo.description)
    setMeta('property', 'og:image', seo.ogImageUrl)
    setMeta('property', 'og:url', seo.canonicalUrl)
    setMeta('name', 'twitter:title', seo.title)
    setMeta('name', 'twitter:description', seo.description)
    setMeta('name', 'twitter:image', seo.ogImageUrl)
    setCanonical(seo.canonicalUrl)
  }, [seo])

  return null
}

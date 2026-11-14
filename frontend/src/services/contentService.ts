import type { PortfolioContent } from '@/types/content'
import { apiClient, resolveMediaUrl } from './apiClient'

/** Makes API media paths usable from the browser. Shared by the public site and the editor. */
export function normalizeContent(data: PortfolioContent): PortfolioContent {
  return {
    ...data,
    profile: {
      ...data.profile,
      photoUrl: resolveMediaUrl(data.profile.photoUrl),
      resumeUrl: resolveMediaUrl(data.profile.resumeUrl),
    },
    projects: data.projects && {
      ...data.projects,
      items: data.projects.items.map((project) => ({ ...project, imageUrl: resolveMediaUrl(project.imageUrl) })),
    },
    seo: { ...data.seo, ogImageUrl: resolveMediaUrl(data.seo.ogImageUrl) },
    styles: data.styles ?? {},
  }
}

/**
 * Loads the published portfolio. The backend only ever serves the latest
 * published snapshot, so drafts never reach visitors and publishing needs no
 * frontend rebuild.
 */
export async function fetchPortfolioContent(): Promise<PortfolioContent> {
  const { data } = await apiClient.get<PortfolioContent>('/portfolio')
  return normalizeContent(data)
}

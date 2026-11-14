import type { SocialLink } from '@/types/content'
import { apiClient } from './apiClient'

/**
 * Public GitHub activity, fetched and cached by the backend
 * (GET /api/v1/github), so visitors' browsers never call GitHub directly.
 */
export interface GitHubActivity {
  profile: {
    login: string
    name: string | null
    avatarUrl: string | null
    profileUrl: string
    bio: string | null
    memberSince: string | null
  }
  stats: { publicRepos: number; followers: number; following: number; totalStars: number }
  /** Primary languages of the user's own repositories, most used first; share is 0–1. */
  languages: { name: string; repos: number; share: number }[]
  repos: {
    id: number
    name: string
    description: string | null
    url: string
    language: string | null
    stars: number
    forks: number
    updatedAt: string | null
  }[]
  /**
   * Last year of daily activity. "calendar" is GitHub's contribution graph (backend has a
   * token); "commits" counts the user's commits in their `repositories` most recently pushed repos.
   */
  contributions: {
    total: number
    days: { date: string; count: number }[]
    source: 'calendar' | 'commits'
    repositories: number
    /** Contributions in private repositories, included in `total` (counts only; "calendar" source). */
    privateContributions?: number
  } | null
  fetchedAt: string
}

const USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/
const PROFILE_URL = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]{1,39})\/?(?:[?#].*)?$/i

/**
 * The GitHub username the section shows: the one set in the profile, or else
 * the one in the GitHub social link. Mirrors the backend's rule.
 */
export function resolveGitHubUsername(username: string | null, links: SocialLink[] = []): string | null {
  if (username && USERNAME.test(username)) return username
  for (const link of links) {
    if (link.platform !== 'github' || !link.url) continue
    const match = PROFILE_URL.exec(link.url.trim())
    if (match && USERNAME.test(match[1])) return match[1]
  }
  return null
}

export async function fetchGitHubActivity(): Promise<GitHubActivity> {
  const { data } = await apiClient.get<GitHubActivity>('/github')
  return data
}

/** Contribution intensity 0–4 for a day, relative to the busiest days (like GitHub's own graph). */
export function contributionLevels(counts: number[]): (count: number) => 0 | 1 | 2 | 3 | 4 {
  const active = counts.filter((c) => c > 0).sort((a, b) => a - b)
  if (active.length === 0) return () => 0
  const at = (q: number) => active[Math.min(active.length - 1, Math.floor(q * active.length))]
  const [q1, q2, q3] = [at(0.25), at(0.5), at(0.75)]
  return (count) => (count <= 0 ? 0 : count <= q1 ? 1 : count <= q2 ? 2 : count <= q3 ? 3 : 4)
}

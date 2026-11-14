import axios from 'axios'

export interface GitHubProfile {
  login: string
  name: string | null
  avatarUrl: string
  profileUrl: string
  publicRepos: number
  followers: number
}

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  updatedAt: string
}

export interface GitHubActivity {
  profile: GitHubProfile
  repos: GitHubRepo[]
}

interface RawUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
}

interface RawRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
}

const github = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10_000,
  headers: { Accept: 'application/vnd.github+json' },
})

/** Public profile and most recently pushed public repositories. */
export async function fetchGitHubActivity(username: string): Promise<GitHubActivity> {
  const user = encodeURIComponent(username)
  const [profileRes, reposRes] = await Promise.all([
    github.get<RawUser>(`/users/${user}`),
    github.get<RawRepo[]>(`/users/${user}/repos`, { params: { sort: 'pushed', per_page: 12 } }),
  ])

  return {
    profile: {
      login: profileRes.data.login,
      name: profileRes.data.name,
      avatarUrl: profileRes.data.avatar_url,
      profileUrl: profileRes.data.html_url,
      publicRepos: profileRes.data.public_repos,
      followers: profileRes.data.followers,
    },
    repos: reposRes.data
      .filter((repo) => !repo.fork)
      .slice(0, 6)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: repo.pushed_at,
      })),
  }
}

import { useQuery } from '@tanstack/react-query'
import { fetchGitHubActivity } from '@/services/githubService'

export function useGitHubActivity(username: string | null) {
  return useQuery({
    queryKey: ['github-activity', username],
    queryFn: () => fetchGitHubActivity(username as string),
    enabled: Boolean(username),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

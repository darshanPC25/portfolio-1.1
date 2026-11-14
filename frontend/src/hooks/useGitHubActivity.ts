import { useQuery } from '@tanstack/react-query'
import { fetchGitHubActivity } from '@/services/githubService'

/** GitHub activity for `username` (served and cached by the backend). Disabled while null. */
export function useGitHubActivity(username: string | null) {
  return useQuery({
    queryKey: ['github-activity', username],
    queryFn: fetchGitHubActivity,
    enabled: Boolean(username),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

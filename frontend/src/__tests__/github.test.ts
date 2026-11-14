import { describe, expect, it } from 'vitest'
import { contributionLevels, resolveGitHubUsername } from '@/services/githubService'
import type { SocialLink } from '@/types/content'

const link = (url: string | null, platform: SocialLink['platform'] = 'github'): SocialLink => ({
  id: '1',
  platform,
  label: 'GitHub',
  url,
})

describe('GitHub username (same rule as the backend)', () => {
  it('prefers the profile username, else the GitHub social link', () => {
    expect(resolveGitHubUsername('octo', [link('https://github.com/other')])).toBe('octo')
    expect(resolveGitHubUsername(null, [link('https://github.com/darshanPC25')])).toBe('darshanPC25')
    expect(resolveGitHubUsername(null, [link('https://www.github.com/darshanPC25/')])).toBe('darshanPC25')
  })

  it('ignores other platforms, other hosts and invalid names', () => {
    expect(resolveGitHubUsername(null, [link('https://github.com/x', 'linkedin')])).toBeNull()
    expect(resolveGitHubUsername(null, [link('https://evil.example/darshan')])).toBeNull()
    expect(resolveGitHubUsername(null, [link(null)])).toBeNull()
    expect(resolveGitHubUsername('../admin', [])).toBeNull()
    expect(resolveGitHubUsername(null, [])).toBeNull()
  })
})

describe('contribution levels', () => {
  it('maps zero to 0 and spreads active days over levels 1–4', () => {
    const level = contributionLevels([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(level(0)).toBe(0)
    expect(level(1)).toBe(1)
    expect(level(8)).toBe(4)
    expect(level(4)).toBeGreaterThan(level(2))
  })

  it('handles a year with no contributions', () => {
    expect(contributionLevels([0, 0, 0])(0)).toBe(0)
  })
})

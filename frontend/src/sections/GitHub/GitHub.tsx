import { ArrowUpRight, GitFork, Star } from 'lucide-react'
import { Button } from '@/components/Buttons/Button'
import { GitHubIcon } from '@/components/UI/BrandIcons'
import { Card } from '@/components/UI/Card'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { Tag } from '@/components/UI/Tag'
import { useEditables } from '@/editor/editable'
import { useGitHubActivity } from '@/hooks/useGitHubActivity'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { type GitHubActivity, resolveGitHubUsername } from '@/services/githubService'
import { formatMonthYear } from '@/utils/format'
import { STAGGER } from '@/utils/motion'
import { ContributionCalendar } from './ContributionCalendar'
import { LanguageBar } from './LanguageBar'

function StatusCard({ message }: { message: string }) {
  return (
    <Card padding="lg" className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-linear-to-b from-mist to-sage text-forest">
        <GitHubIcon size={26} />
      </span>
      <p className="text-lg text-forest">{message}</p>
    </Card>
  )
}

function LoadingState() {
  return (
    <div role="status" className="mt-14">
      <span className="sr-only">Loading GitHub activity…</span>
      <div aria-hidden="true" className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <div className="surface-clay h-64 animate-pulse rounded-card" />
        <div className="surface-clay h-64 animate-pulse rounded-card" />
      </div>
    </div>
  )
}

const number = new Intl.NumberFormat('en')

function ProfileCard({ data }: { data: GitHubActivity }) {
  const { profile, stats } = data
  const items = [
    { label: 'Public repositories', value: stats.publicRepos },
    { label: 'Stars earned', value: stats.totalStars },
    { label: 'Followers', value: stats.followers },
    { label: 'Following', value: stats.following },
  ]
  return (
    <Card padding="lg" className="flex h-full flex-col">
      <div className="flex items-center gap-4">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="size-16 rounded-full border border-white/80 object-cover shadow-soft"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-b from-mist to-sage text-forest">
            <GitHubIcon size={28} />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-medium text-ink">{profile.name ?? profile.login}</p>
          <p className="truncate text-sm text-muted">@{profile.login}</p>
        </div>
      </div>
      {profile.bio && <p className="mt-4 text-sm text-muted">{profile.bio}</p>}

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <dd className="font-serif text-4xl leading-none text-forest">{number.format(item.value)}</dd>
            <dt className="mt-1 text-xs text-muted">{item.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-7">
        <Button href={profile.profileUrl} variant="secondary" size="sm" icon={<ArrowUpRight size={16} />}>
          View profile
        </Button>
        {profile.memberSince && (
          <span className="text-xs text-muted">On GitHub since {formatMonthYear(profile.memberSince)}</span>
        )}
      </div>
    </Card>
  )
}

function RepoCard({ repo }: { repo: GitHubActivity['repos'][number] }) {
  return (
    <Card interactive className="relative flex h-full flex-col">
      <h3 className="text-lg font-medium break-words text-ink">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="after:absolute after:inset-0 after:rounded-card"
        >
          {repo.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{repo.description ?? 'No description provided.'}</p>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-xs text-muted">
        {repo.language && <Tag tone="green">{repo.language}</Tag>}
        <span className="inline-flex items-center gap-1">
          <Star size={13} aria-hidden="true" />
          {repo.stars}
          <span className="sr-only"> stars</span>
        </span>
        {repo.forks > 0 && (
          <span className="inline-flex items-center gap-1">
            <GitFork size={13} aria-hidden="true" />
            {repo.forks}
            <span className="sr-only"> forks</span>
          </span>
        )}
        {repo.updatedAt && <span>Updated {formatMonthYear(repo.updatedAt)}</span>}
      </div>
    </Card>
  )
}

export function GitHub() {
  const { github, socialLinks } = usePortfolioContent()
  const edit = useEditables()
  const username = github ? resolveGitHubUsername(github.username, socialLinks) : null
  const { data, isPending, isError } = useGitHubActivity(username)
  if (!github) return null

  return (
    <Section id="github" background="bg-ivory">
      <SectionHeading id="github" eyebrow={github.eyebrow} heading={github.heading} intro={github.intro} />

      {!username && github.emptyMessage && (
        <div {...edit('github.emptyMessage')}>
          <StatusCard message={github.emptyMessage} />
        </div>
      )}

      {username && isPending && <LoadingState />}

      {username && isError && (
        <StatusCard message="GitHub activity could not be loaded right now. Please try again later." />
      )}

      {data && (
        <>
          <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Reveal className="h-full">
              <ProfileCard data={data} />
            </Reveal>
            <Reveal delay={STAGGER} className="h-full">
              <Card padding="lg" className="flex h-full flex-col gap-8">
                {data.contributions ? (
                  <ContributionCalendar contributions={data.contributions} />
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Recent activity</h3>
                    <p className="mt-3 text-muted">
                      {data.repos[0]?.updatedAt
                        ? `Last pushed to ${data.repos[0].name} in ${formatMonthYear(data.repos[0].updatedAt)}.`
                        : 'No public pushes yet.'}
                    </p>
                  </div>
                )}
                {data.languages.length > 0 && <LanguageBar languages={data.languages} />}
              </Card>
            </Reveal>
          </div>

          <h3 className="mt-14 text-sm font-semibold tracking-[0.14em] text-muted uppercase">
            Recently updated repositories
          </h3>
          {data.repos.length > 0 ? (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.repos.map((repo, index) => (
                <li key={repo.id}>
                  <Reveal delay={(index % 3) * STAGGER} className="h-full">
                    <RepoCard repo={repo} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <StatusCard message="No public repositories yet." />
          )}
        </>
      )}
    </Section>
  )
}

import { ArrowUpRight, Star } from 'lucide-react'
import { Button } from '@/components/Buttons/Button'
import { GitHubIcon } from '@/components/UI/BrandIcons'
import { Card } from '@/components/UI/Card'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { Tag } from '@/components/UI/Tag'
import { useGitHubActivity } from '@/hooks/useGitHubActivity'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { formatMonthYear } from '@/utils/format'
import { STAGGER } from '@/utils/motion'
import { useEditables } from '@/editor/editable'

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

function LoadingGrid() {
  return (
    <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="surface-clay h-40 animate-pulse rounded-card" />
      ))}
    </ul>
  )
}

export function GitHub() {
  const { github } = usePortfolioContent()
  const edit = useEditables()
  const { data, isPending, isError } = useGitHubActivity(github?.username ?? null)
  if (!github) return null

  return (
    <Section id="github" background="bg-ivory">
      <SectionHeading id="github" eyebrow={github.eyebrow} heading={github.heading} intro={github.intro} />

      {!github.username && github.emptyMessage && (
        <div {...edit('github.emptyMessage')}>
          <StatusCard message={github.emptyMessage} />
        </div>
      )}

      {github.username && isPending && (
        <div role="status">
          <span className="sr-only">Loading GitHub activity…</span>
          <LoadingGrid />
        </div>
      )}

      {github.username && isError && (
        <StatusCard message="GitHub activity could not be loaded right now. Please try again later." />
      )}

      {data && (
        <>
          <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <dl className="flex gap-10">
              <div className="text-center">
                <dd className="font-serif text-5xl text-olive">{data.profile.publicRepos}</dd>
                <dt className="text-sm text-muted">Public repositories</dt>
              </div>
              <div className="text-center">
                <dd className="font-serif text-5xl text-olive">{data.profile.followers}</dd>
                <dt className="text-sm text-muted">Followers</dt>
              </div>
            </dl>
            <Button href={data.profile.profileUrl} variant="secondary" icon={<ArrowUpRight size={18} />}>
              @{data.profile.login} on GitHub
            </Button>
          </Reveal>

          {data.repos.length > 0 ? (
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.repos.map((repo, index) => (
                <li key={repo.id}>
                  <Reveal delay={(index % 3) * STAGGER} className="h-full">
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
                      <p className="mt-2 line-clamp-3 text-sm text-muted">
                        {repo.description ?? 'No description provided.'}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-xs text-muted">
                        {repo.language && <Tag tone="green">{repo.language}</Tag>}
                        <span className="inline-flex items-center gap-1">
                          <Star size={13} aria-hidden="true" />
                          {repo.stars}
                          <span className="sr-only"> stars</span>
                        </span>
                        <span>Updated {formatMonthYear(repo.updatedAt)}</span>
                      </div>
                    </Card>
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

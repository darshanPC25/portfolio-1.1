import { useQuery } from '@tanstack/react-query'
import { Clock, FolderKanban, Layers, Mail, MousePointerClick, Rocket, Wrench, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage } from '../api/queries'
import { EmptyState, formatDateTime, LoadState, PageHeader, Panel, StatusPill } from '../components/ui'

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  to,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  detail?: ReactNode
  to?: string
}) {
  const body = (
    <>
      <span className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-b from-mist to-sage text-forest">
        <Icon size={19} aria-hidden="true" />
      </span>
      <dt className="mt-4 text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 text-3xl tracking-tight text-ink">{value}</dd>
      {detail && <dd className="mt-1 text-sm text-muted">{detail}</dd>}
    </>
  )
  const className = 'block h-full rounded-card border border-sand/70 bg-ivory p-5 shadow-soft'
  return to ? (
    <Link to={to} className={`${className} transition-transform duration-300 ease-soft hover:-translate-y-0.5`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

/** Dashboard: real counts from the database and the publishing state. */
export function OverviewPage() {
  const overview = useQuery({ queryKey: adminKeys.overview, queryFn: adminApi.overview })
  const publications = useQuery({ queryKey: adminKeys.publications, queryFn: adminApi.publications })
  const data = overview.data

  return (
    <>
      <PageHeader
        title="Overview"
        description="Everything here is counted live from the database. Edits are saved to a draft; visitors see them after you publish."
        actions={
          <Link
            to="/admin/editor"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-b from-moss to-forest px-5 font-medium text-ivory shadow-button hover:from-forest hover:to-pine"
          >
            <MousePointerClick size={18} aria-hidden="true" />
            Edit Website
          </Link>
        }
      />

      {overview.isPending ? (
        <LoadState />
      ) : !data ? (
        <LoadState error={errorMessage(overview.error)} onRetry={() => overview.refetch()} />
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={FolderKanban}
              label="Projects"
              value={data.projects.total}
              detail={`${data.projects.published} shown · ${data.projects.total - data.projects.published} hidden`}
              to="/admin/projects"
            />
            <Stat
              icon={Wrench}
              label="Skills"
              value={data.skills}
              detail={`in ${data.skillCategories} ${data.skillCategories === 1 ? 'category' : 'categories'}`}
              to="/admin/skills"
            />
            <Stat
              icon={Layers}
              label="Page sections"
              value={`${data.sections.visible} shown`}
              detail={`${data.sections.hidden} hidden`}
              to="/admin/appearance"
            />
            <Stat
              icon={Mail}
              label="Contact messages"
              value={data.messages.total}
              detail={data.messages.unread > 0 ? `${data.messages.unread} unread` : 'All read'}
              to="/admin/messages"
            />
          </dl>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Publishing">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted">
                    <Clock size={15} aria-hidden="true" /> Draft last changed
                  </dt>
                  <dd className="mt-1 text-lg text-ink">{formatDateTime(data.draftLastChangedAt)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted">
                    <Rocket size={15} aria-hidden="true" /> Last published
                  </dt>
                  <dd className="mt-1 text-lg text-ink">
                    {data.lastPublication
                      ? `${formatDateTime(data.lastPublication.publishedAt)} (v${data.lastPublication.version})`
                      : 'Never'}
                  </dd>
                </div>
              </dl>
              <p className="mt-5">
                {data.hasUnpublishedChanges ? (
                  <StatusPill tone="amber">The draft has changes that are not live yet</StatusPill>
                ) : (
                  <StatusPill tone="green">The live site matches the draft</StatusPill>
                )}
              </p>
            </Panel>

            <Panel title="Recent publications">
              {publications.isPending ? (
                <LoadState />
              ) : publications.isError ? (
                <LoadState error={errorMessage(publications.error)} onRetry={() => publications.refetch()} />
              ) : publications.data.length === 0 ? (
                <EmptyState>Nothing has been published yet.</EmptyState>
              ) : (
                <ol className="divide-y divide-sand/70">
                  {publications.data.slice(0, 6).map((p) => (
                    <li key={p.version} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                      <span className="font-medium text-ink">
                        v{p.version}
                        {p.note && <span className="ml-2 font-normal text-muted">{p.note}</span>}
                      </span>
                      <span className="text-sm text-muted">
                        {formatDateTime(p.publishedAt)}
                        {p.publishedBy ? ` · ${p.publishedBy}` : ' · automatic'}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  )
}

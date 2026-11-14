import type { CSSProperties } from 'react'
import { contributionLevels, type GitHubActivity } from '@/services/githubService'
import { cn } from '@/utils/cn'

/** Weeks shown on phones (about six months). */
const PHONE_WEEKS = 26

/** Cell colours per level; palette tokens, so the calendar follows the light/dark theme. */
const LEVELS = ['bg-sand/70', 'bg-sage', 'bg-fern', 'bg-olive', 'bg-forest'] as const

const monthFormat = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
const dayFormat = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

type Contributions = NonNullable<GitHubActivity['contributions']>

/** Last year's contributions as a week-by-week grid, like GitHub's own graph. */
export function ContributionCalendar({ contributions }: { contributions: Contributions }) {
  const days = contributions.days
  const level = contributionLevels(days.map((d) => d.count))

  // Columns are weeks starting on Sunday; pad the first week so weekdays line up.
  const firstWeekday = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0
  const cells: (Contributions['days'][number] | null)[] = [...Array(firstWeekday).fill(null), ...days]
  const weeks: (typeof cells)[] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  // Month label above the first week that starts in that month.
  const monthLabels = weeks.map((week, index) => {
    const first = week.find(Boolean)
    if (!first) return ''
    const date = new Date(`${first.date}T00:00:00Z`)
    const previous = index > 0 ? weeks[index - 1].find(Boolean) : null
    const changed = !previous || new Date(`${previous.date}T00:00:00Z`).getUTCMonth() !== date.getUTCMonth()
    return changed && date.getUTCDate() <= 7 ? monthFormat.format(date) : ''
  })

  // Phones show the most recent weeks at a readable size; wider screens the whole year.
  const older = (index: number) => index < weeks.length - PHONE_WEEKS

  const commits = contributions.source === 'commits'
  const noun = commits ? 'commit' : 'contribution'
  const privateCount = contributions.privateContributions ?? 0
  const busiest = days.reduce((max, d) => (d.count > max.count ? d : max), { date: '', count: 0 })

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">
          {commits ? 'Commit activity' : 'Contributions'}
        </h3>
        <p className="text-sm text-muted">
          <span className="font-serif text-2xl text-forest">{contributions.total.toLocaleString('en')}</span> {noun}
          {contributions.total === 1 ? '' : 's'} in the last year
          {privateCount > 0 && (
            <span className="block text-right text-xs">
              including {privateCount.toLocaleString('en')} in private repositories
            </span>
          )}
        </p>
      </div>

      <div
        role="img"
        aria-label={`${contributions.total} ${noun}s in the last year${
          privateCount > 0 ? `, including ${privateCount} in private repositories` : ''
        }${
          busiest.count
            ? `; the busiest day was ${dayFormat.format(new Date(`${busiest.date}T00:00:00Z`))} with ${busiest.count}`
            : ''
        }.`}
        className="mt-4"
      >
        {/* Cells scale with the card (one column per week), so the whole year fits without scrolling. */}
        <div
          aria-hidden="true"
          className="grid [grid-template-columns:repeat(var(--recent),minmax(0,1fr))] gap-[2px] text-[10px] leading-none text-muted sm:[grid-template-columns:repeat(var(--weeks),minmax(0,1fr))] sm:gap-[3px]"
          style={{ '--weeks': weeks.length, '--recent': Math.min(PHONE_WEEKS, weeks.length) } as CSSProperties}
        >
          {monthLabels.map((label, index) => (
            <span
              key={`m-${index}`}
              className={cn('overflow-visible pb-1 whitespace-nowrap', older(index) && 'hidden sm:block')}
            >
              {label}
            </span>
          ))}
          {weeks.map((week, index) => (
            <div key={index} className={cn('grid gap-[2px] sm:gap-[3px]', older(index) && 'hidden sm:grid')}>
              {Array.from({ length: 7 }, (_, d) => {
                const day = week[d]
                return day ? (
                  <span
                    key={day.date}
                    title={`${day.count} ${noun}${day.count === 1 ? '' : 's'} on ${dayFormat.format(new Date(`${day.date}T00:00:00Z`))}`}
                    className={`aspect-square rounded-[2px] ${LEVELS[level(day.count)]}`}
                  />
                ) : (
                  <span key={`pad-${d}`} className="aspect-square" />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted">
        <span>
          <span className="sm:hidden">Showing the last 6 months. </span>
          {commits &&
            `Counted from ${contributions.repositories} recently active public ${
              contributions.repositories === 1 ? 'repository' : 'repositories'
            }.`}
        </span>
        <span className="flex items-center gap-1.5" aria-hidden="true">
          Less
          {LEVELS.map((cls) => (
            <span key={cls} className={`size-[11px] rounded-[3px] ${cls}`} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}

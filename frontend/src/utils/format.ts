const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

/** "2026-03-04T10:00:00Z" -> "Mar 2026" */
export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}

/** True for links that leave the site (http, https, mailto). */
export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:)/i.test(href)
}

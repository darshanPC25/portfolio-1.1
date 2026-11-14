import type { GitHubActivity } from '@/services/githubService'

/** Greens from the palette, darkest first; they follow the light/dark theme tokens. */
const SWATCHES = ['bg-forest', 'bg-moss', 'bg-olive', 'bg-fern', 'bg-sage', 'bg-stone']

/** Share of the user's repositories per primary language, as one stacked bar with a legend. */
export function LanguageBar({ languages }: { languages: GitHubActivity['languages'] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">Top languages</h3>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-sand/60" aria-hidden="true">
        {languages.map((language, index) => (
          <span
            key={language.name}
            className={SWATCHES[index % SWATCHES.length]}
            style={{ width: `${language.share * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {languages.map((language, index) => (
          <li key={language.name} className="inline-flex items-center gap-2 text-ink">
            <span className={`size-2.5 rounded-full ${SWATCHES[index % SWATCHES.length]}`} aria-hidden="true" />
            {language.name}
            <span className="text-muted">
              {Math.round(language.share * 100)}%<span className="sr-only"> of repositories ({language.repos})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

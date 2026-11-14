import { ExternalLink } from 'lucide-react'
import { GitHubIcon } from '@/components/UI/BrandIcons'
import type { Project } from '@/types/content'
import { cn } from '@/utils/cn'

const chip =
  'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300'
const live = 'border-forest/20 bg-ivory text-forest hover:border-forest/50 hover:text-pine'
const pending = 'border-dashed border-stone bg-transparent text-muted'

/**
 * Repository and demo links. Until a real URL exists the slot is shown as a
 * non-interactive "coming soon" chip instead of a dead link.
 */
export function ProjectLinks({ project, className }: { project: Project; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-2.5', className)}>
      <li>
        {project.repoUrl ? (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={cn(chip, live)}>
            <GitHubIcon size={16} />
            Source code
            <span className="sr-only"> for {project.name} (opens in a new tab)</span>
          </a>
        ) : (
          <span className={cn(chip, pending)}>
            <GitHubIcon size={16} />
            Code coming soon
          </span>
        )}
      </li>
      <li>
        {project.demoUrl ? (
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={cn(chip, live)}>
            <ExternalLink size={16} aria-hidden="true" />
            Live demo
            <span className="sr-only"> of {project.name} (opens in a new tab)</span>
          </a>
        ) : (
          <span className={cn(chip, pending)}>
            <ExternalLink size={16} aria-hidden="true" />
            Demo coming soon
          </span>
        )}
      </li>
    </ul>
  )
}

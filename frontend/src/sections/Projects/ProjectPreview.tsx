import type { Project } from '@/types/content'
import { cn } from '@/utils/cn'

interface ProjectPreviewProps {
  project: Project
  /** Load immediately instead of lazily (for images near the top of a dialog). */
  eager?: boolean
  className?: string
}

/** Project image inside the rounded device-style frame used in the reference. */
export function ProjectPreview({ project, eager = false, className }: ProjectPreviewProps) {
  return (
    <div className={cn('rounded-[1.4rem] border border-white/80 bg-sand/60 p-2 shadow-soft', className)}>
      <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-cream">
        <img
          src={project.imageUrl}
          alt={project.imageAlt}
          width={800}
          height={500}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="size-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
        />
      </div>
    </div>
  )
}

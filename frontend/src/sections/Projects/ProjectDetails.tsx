import { Check } from 'lucide-react'
import { Modal } from '@/components/UI/Modal'
import { Tag } from '@/components/UI/Tag'
import type { Project } from '@/types/content'
import { ProjectLinks } from './ProjectLinks'
import { ProjectPreview } from './ProjectPreview'
import { PROJECT_STATUS_LABEL } from './projectStatus'

interface ProjectDetailsProps {
  project: Project | null
  onClose: () => void
}

/** Detail dialog opened from "View details". */
export function ProjectDetails({ project, onClose }: ProjectDetailsProps) {
  return (
    <Modal open={project !== null} onClose={onClose} labelledBy="project-details-title">
      {project && (
        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-2 md:gap-10 md:p-10">
          <ProjectPreview project={project} eager className="self-start" />
          <div>
            <Tag tone="green">{PROJECT_STATUS_LABEL[project.status]}</Tag>
            <h3
              id="project-details-title"
              className="mt-4 pr-10 text-3xl leading-tight tracking-tight text-balance text-ink md:pr-0"
            >
              {project.name}
            </h3>
            <p className="mt-4 text-pretty text-muted">{project.description}</p>

            <h4 className="mt-7 font-serif text-lg text-muted italic">What it covers</h4>
            <ul className="mt-3 flex flex-col gap-2.5">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-ink">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-mist text-forest">
                    <Check size={13} aria-hidden="true" />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>

            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Topics">
              {project.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>

            <ProjectLinks project={project} className="mt-7" />
          </div>
        </div>
      )}
    </Modal>
  )
}

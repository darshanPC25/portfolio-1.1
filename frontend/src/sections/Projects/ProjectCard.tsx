import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/Buttons/Button'
import { Blob } from '@/components/UI/Blob'
import { Card } from '@/components/UI/Card'
import { Tag } from '@/components/UI/Tag'
import { TiltCard } from '@/components/UI/TiltCard'
import type { Project } from '@/types/content'
import { ProjectLinks } from './ProjectLinks'
import { ProjectPreview } from './ProjectPreview'
import { PROJECT_STATUS_LABEL } from './projectStatus'

interface ProjectCardProps {
  project: Project
  onViewDetails: (project: Project) => void
}

function ProjectTags({ project }: { project: Project }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Topics">
      {project.tags.map((tag) => (
        <li key={tag}>
          <Tag>{tag}</Tag>
        </li>
      ))}
    </ul>
  )
}

/** Large editorial layout for the featured project. */
export function FeaturedProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <article className="group relative grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      <div className="order-2 lg:order-1">
        <Tag tone="green">{PROJECT_STATUS_LABEL[project.status]}</Tag>
        <h3 className="mt-4 text-3xl leading-tight tracking-tight text-balance text-ink sm:text-4xl">
          {project.name}
        </h3>
        <p className="mt-4 max-w-[46ch] text-lg text-pretty text-muted">{project.description}</p>
        <div className="mt-6">
          <ProjectTags project={project} />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={() => onViewDetails(project)} icon={<ArrowUpRight size={18} />}>
            View details
            <span className="sr-only"> of {project.name}</span>
          </Button>
        </div>
        <ProjectLinks project={project} className="mt-4" />
      </div>

      <div className="relative order-1 lg:order-2">
        <Blob tone="olive" className="top-[-12%] right-[-6%] size-[42%]" />
        <Blob tone="sage" className="bottom-[-14%] left-[-8%] size-[46%]" drift="normal" />
        <Blob tone="cream" round className="top-[8%] left-[-5%] size-[13%]" drift="normal" />
        <TiltCard max={4} radius="rounded-panel">
          <div className="surface-glass relative rounded-panel p-4 sm:p-6">
            <ProjectPreview project={project} />
          </div>
        </TiltCard>
      </div>
    </article>
  )
}

/** Compact card used in the project grid. */
export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <TiltCard>
      <Card
        padding="none"
        className="group flex h-full flex-col p-3 transition-shadow duration-500 ease-soft hover:shadow-lift"
      >
        <ProjectPreview project={project} />
        <div className="flex flex-1 flex-col px-3 pt-6 pb-3">
          <Tag tone="green" className="self-start">
            {PROJECT_STATUS_LABEL[project.status]}
          </Tag>
          <h3 className="mt-3 text-2xl leading-snug tracking-tight text-balance text-ink">{project.name}</h3>
          <p className="mt-2 text-[0.95rem] text-pretty text-muted">{project.summary}</p>
          <div className="mt-5">
            <ProjectTags project={project} />
          </div>
          <div className="mt-auto pt-6">
            <ProjectLinks project={project} />
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 -ml-3"
              onClick={() => onViewDetails(project)}
              icon={<ArrowUpRight size={16} />}
            >
              View details
              <span className="sr-only"> of {project.name}</span>
            </Button>
          </div>
        </div>
      </Card>
    </TiltCard>
  )
}

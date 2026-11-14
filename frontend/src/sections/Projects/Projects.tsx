import { useState } from 'react'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import type { Project } from '@/types/content'
import { STAGGER } from '@/utils/motion'
import { FeaturedProjectCard, ProjectCard } from './ProjectCard'
import { ProjectDetails } from './ProjectDetails'

export function Projects() {
  const { projects } = usePortfolioContent()
  const [selected, setSelected] = useState<Project | null>(null)

  const ordered = [...projects.items].sort((a, b) => a.order - b.order)
  const featured = ordered.filter((project) => project.featured)
  const others = ordered.filter((project) => !project.featured)

  return (
    <Section id="projects" background="bg-wash-sage">
      <SectionHeading id="projects" eyebrow={projects.eyebrow} heading={projects.heading} intro={projects.intro} />

      <div className="mt-16 flex flex-col gap-20 md:mt-20">
        {featured.map((project) => (
          <Reveal key={project.id}>
            <FeaturedProjectCard project={project} onViewDetails={setSelected} />
          </Reveal>
        ))}
      </div>

      {others.length > 0 && (
        <ul className="mt-20 grid gap-6 md:grid-cols-2 lg:mt-28 lg:grid-cols-3">
          {others.map((project, index) => (
            <li key={project.id}>
              <Reveal delay={index * STAGGER} className="h-full">
                <ProjectCard project={project} onViewDetails={setSelected} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      <ProjectDetails project={selected} onClose={() => setSelected(null)} />
    </Section>
  )
}

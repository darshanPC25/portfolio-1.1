import { Braces, Database, type LucideIcon, Network, Server, Wrench } from 'lucide-react'
import { Blob } from '@/components/UI/Blob'
import { Card } from '@/components/UI/Card'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { Tag } from '@/components/UI/Tag'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import type { SkillIcon } from '@/types/content'
import { STAGGER } from '@/utils/motion'
import { useEditables } from '@/editor/editable'

const ICONS: Record<SkillIcon, LucideIcon> = {
  code: Braces,
  server: Server,
  database: Database,
  network: Network,
  tools: Wrench,
}

export function Skills() {
  const { skills } = usePortfolioContent()
  const edit = useEditables()
  if (!skills) return null
  const groups = [...skills.groups].sort((a, b) => a.order - b.order)

  return (
    <Section
      id="skills"
      background="bg-ivory"
      decoration={<Blob tone="olive" className="right-[-4rem] bottom-16 size-40 opacity-90 md:size-56" />}
    >
      <SectionHeading id="skills" eyebrow={skills.eyebrow} heading={skills.heading} intro={skills.intro} />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group, index) => {
          const Icon = ICONS[group.icon]
          return (
            <li key={group.id}>
              <Reveal delay={index * STAGGER} className="h-full">
                <Card {...edit(`skillgroup.${group.id}`)} interactive padding="lg" className="flex h-full flex-col">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-b from-mist to-sage text-forest shadow-soft">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-2xl tracking-tight text-ink">{group.title}</h3>
                  <p className="mt-1 text-sm text-muted">{group.description}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li key={skill.id} {...edit(`skill.${skill.id}`)}>
                        <Tag tone="green" className="px-3 py-1.5 text-sm">
                          {skill.name}
                        </Tag>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

import { GraduationCap } from 'lucide-react'
import { Blob } from '@/components/UI/Blob'
import { Card } from '@/components/UI/Card'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { STAGGER } from '@/utils/motion'

export function Education() {
  const { education } = usePortfolioContent()
  if (!education) return null
  const entries = [...education.entries].sort((a, b) => a.order - b.order)

  return (
    <Section
      id="education"
      background="bg-wash-cream"
      decoration={
        <>
          <Blob tone="sage" className="top-16 right-[-4rem] size-44 md:size-60" />
          <Blob tone="olive" round className="bottom-24 left-[6%] size-10" drift="normal" />
        </>
      }
    >
      <SectionHeading id="education" eyebrow={education.eyebrow} heading={education.heading} />

      <ul className="mx-auto mt-14 flex max-w-4xl flex-col gap-6">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <Reveal delay={index * STAGGER}>
              <Card padding="lg" className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-8 md:p-10">
                <span className="flex size-16 items-center justify-center rounded-3xl bg-linear-to-b from-moss to-forest text-ivory shadow-button">
                  <GraduationCap size={28} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-xl text-olive italic">{entry.period}</p>
                  <h3 className="mt-1 text-2xl tracking-tight text-ink sm:text-3xl">{entry.degree}</h3>
                  <p className="mt-1 text-lg font-medium text-forest">{entry.field}</p>
                  {entry.institution && <p className="mt-1 text-muted">{entry.institution}</p>}
                  <p className="mt-4 max-w-[60ch] text-pretty text-muted">{entry.description}</p>
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}

import { Blob } from '@/components/UI/Blob'
import { Card } from '@/components/UI/Card'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { cn } from '@/utils/cn'
import { STAGGER } from '@/utils/motion'

/* Slight alternating tilt, echoing the numbered tiles in the reference. */
const TILTS = ['lg:-rotate-2', 'lg:rotate-1 lg:-translate-y-4', 'lg:rotate-2']

export function About() {
  const { about } = usePortfolioContent()

  return (
    <Section
      id="about"
      background="bg-wash-sage"
      decoration={
        <>
          <Blob tone="sage" className="top-24 left-[-5rem] size-48 opacity-80 md:size-64" />
          <Blob tone="cream" round className="top-[38%] right-[-2.5rem] size-28 md:size-36" drift="normal" />
        </>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <SectionHeading id="about" eyebrow={about.eyebrow} heading={about.heading} align="start" />

        <div>
          <Reveal className="flex flex-col gap-5">
            {about.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={cn('text-pretty', index === 0 ? 'text-xl text-ink sm:text-2xl' : 'text-lg text-muted')}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={STAGGER}>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-forest/15 pt-8">
              {about.facts.map((fact) => (
                <div key={fact.id}>
                  <dt className="font-serif text-base text-muted italic">{fact.label}</dt>
                  <dd className="mt-0.5 text-lg font-medium text-forest">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <div className="mt-20 md:mt-28">
        <Reveal>
          <h3 className="text-center text-3xl tracking-tight text-ink sm:text-4xl">{about.approachHeading}</h3>
        </Reveal>
        <ol className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3 lg:gap-7">
          {about.approach.map((step, index) => (
            <li key={step.id}>
              <Reveal delay={index * STAGGER}>
                <Card
                  padding="lg"
                  className={cn('h-full transition-transform duration-500 ease-soft hover:rotate-0', TILTS[index % 3])}
                >
                  <p className="font-serif text-5xl leading-none text-olive">{step.step}</p>
                  <h4 className="mt-8 text-xl font-medium text-ink">{step.title}</h4>
                  <p className="mt-2 text-[0.95rem] text-muted">{step.description}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

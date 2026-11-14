import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SectionHeading } from '@/components/UI/SectionHeading'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { WavePanel } from './WavePanel'

export function Journey() {
  const { journey } = usePortfolioContent()
  const entries = [...journey.entries].sort((a, b) => a.order - b.order)

  return (
    <Section id="journey" background="bg-ivory" className="!max-w-[84rem]">
      <Reveal>
        <WavePanel>
          <div className="grid gap-10 px-6 py-24 sm:px-10 sm:py-28 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-16 lg:py-36">
            <SectionHeading
              id="journey"
              eyebrow={journey.eyebrow}
              heading={journey.heading}
              intro={journey.intro}
              align="start"
              tone="light"
            />

            {entries.length > 0 ? (
              <ol className="flex flex-col self-center">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid gap-x-6 gap-y-1 border-t border-ivory/20 py-6 last:border-b sm:grid-cols-[5.5rem_1fr]"
                  >
                    <p className="font-serif text-xl text-sage italic">{entry.period}</p>
                    <div>
                      <h3 className="text-xl font-medium text-ivory">{entry.title}</h3>
                      {entry.organisation && <p className="text-sm text-sage">{entry.organisation}</p>}
                      <p className="mt-2 text-[0.95rem] text-pretty text-mist">{entry.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="self-center text-lg text-mist">Entries will appear here soon.</p>
            )}
          </div>
        </WavePanel>
      </Reveal>
    </Section>
  )
}

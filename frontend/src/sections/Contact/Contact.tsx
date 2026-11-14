import { MapPin } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { AvailabilityBadge } from '@/components/UI/AvailabilityBadge'
import { Blob } from '@/components/UI/Blob'
import { Reveal } from '@/components/UI/Reveal'
import { Section } from '@/components/UI/Section'
import { SocialLinks } from '@/components/UI/SocialLinks'
import { TextReveal } from '@/components/UI/TextReveal'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { STAGGER } from '@/utils/motion'
import { useEditables } from '@/editor/editable'

// The form brings its validation libraries with it, so it loads separately
// from the first paint of the page.
const ContactForm = lazy(() => import('./ContactForm').then((module) => ({ default: module.ContactForm })))

export function Contact() {
  const { contact, profile, socialLinks } = usePortfolioContent()
  const edit = useEditables()
  if (!contact) return null

  return (
    <Section
      id="contact"
      background="bg-wash-sage"
      decoration={
        <>
          <Blob tone="sage" className="top-10 left-[-5rem] size-52 md:size-72" />
          <Blob tone="olive" className="right-[-3rem] bottom-10 size-36 md:size-52" drift="normal" />
          <Blob tone="cream" round className="top-[18%] right-[12%] size-12" drift="normal" />
        </>
      }
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <p {...edit('section.contact.eyebrow')} className="font-serif text-lg text-muted italic">
            <span aria-hidden="true">/ </span>
            {contact.eyebrow}
            <span aria-hidden="true"> /</span>
          </p>
          <h2
            id="contact-heading"
            {...edit('section.contact.heading')}
            className="font-heading text-5xl leading-[0.98] font-medium tracking-[-0.03em] text-balance text-olive sm:text-6xl lg:text-7xl"
          >
            <TextReveal text={contact.heading} delay={0.1} />
          </h2>
          {contact.intro && (
            <p {...edit('section.contact.intro')} className="max-w-[44ch] text-lg text-pretty text-muted">
              {contact.intro}
            </p>
          )}

          <AvailabilityBadge
            available={profile.availability.available}
            label={profile.availability.label}
            className="mt-2"
          />
          <p {...edit('profile.location')} className="flex items-center gap-2 text-sm text-moss">
            <MapPin size={15} aria-hidden="true" />
            Based in {profile.location}
          </p>
          <SocialLinks links={socialLinks} className="mt-1" />
        </Reveal>

        <Reveal delay={STAGGER}>
          <Suspense fallback={<div className="surface-clay min-h-[32rem] rounded-panel" aria-hidden="true" />}>
            <ContactForm heading={contact.formHeading ?? 'Send a message'} submitLabel={contact.submitLabel ?? 'Send'} />
          </Suspense>
        </Reveal>
      </div>
    </Section>
  )
}

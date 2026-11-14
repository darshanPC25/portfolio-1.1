import { ArrowRight, ArrowUpRight, Download, GraduationCap, MapPin } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/Buttons/Button'
import { AvailabilityBadge } from '@/components/UI/AvailabilityBadge'
import { SplitWords } from '@/components/UI/TextReveal'
import { useHeroIntro } from '@/hooks/useHeroIntro'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { HeroBackdrop } from './HeroBackdrop'

export function Hero() {
  const { hero, profile, education } = usePortfolioContent()
  const sectionRef = useRef<HTMLElement>(null)
  useHeroIntro(sectionRef, !useMotionDisabled())

  const graduation = education?.entries[0]?.period

  return (
    <section
      id="home"
      ref={sectionRef}
      aria-labelledby="home-heading"
      className="bg-hero relative isolate overflow-hidden"
    >
      <HeroBackdrop />

      <div
        data-hero-content
        className="mx-auto flex min-h-svh w-full max-w-page flex-col px-5 pt-28 pb-10 sm:px-8 sm:pt-32"
      >
        <h1 id="home-heading" className="text-center">
          <span className="block font-heading text-[clamp(2.6rem,10.5vw,8.25rem)] leading-[0.95] font-medium tracking-[-0.035em] text-olive">
            <SplitWords text={hero.greeting} />
          </span>
          <span className="-mt-[0.06em] block font-serif text-[clamp(2.9rem,11.5vw,9.25rem)] leading-[0.92] tracking-[-0.02em] text-ink italic">
            <SplitWords text={hero.role} />
          </span>
        </h1>

        <div className="mt-8 grid flex-1 items-center gap-8 lg:-mt-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          {/* Portrait */}
          <figure
            data-hero-portrait
            className="relative z-10 mx-auto w-[min(68vw,19rem)] lg:order-2 lg:w-[21rem] xl:w-[23rem]"
          >
            <div
              data-hero-parallax
              className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2.5rem] border border-white/70 bg-linear-to-b from-mist to-sage shadow-lift">
              {profile.photoUrl && (
              <img
                src={profile.photoUrl}
                alt={profile.photoAlt}
                width={400}
                height={500}
                fetchPriority="high"
                decoding="async"
                className="size-full object-cover"
              />
              )}
            </div>
          </figure>

          {/* Status */}
          <div className="flex flex-col items-center gap-3 lg:order-1 lg:items-start">
            <div data-hero-reveal>
              <AvailabilityBadge available={profile.availability.available} label={profile.availability.label} />
            </div>
            <ul data-hero-reveal className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-moss lg:flex-col lg:pl-3">
              <li className="flex items-center gap-2">
                <MapPin size={15} aria-hidden="true" />
                Based in {profile.location}
              </li>
              {graduation && (
                <li className="flex items-center gap-2">
                  <GraduationCap size={15} aria-hidden="true" />
                  B.Tech CSE · {graduation}
                </li>
              )}
            </ul>
          </div>

          {/* Pitch and actions */}
          <div className="flex flex-col items-center gap-6 text-center lg:order-3 lg:items-start lg:text-left">
            <p data-hero-reveal className="max-w-[30ch] text-lg text-pretty text-forest sm:text-xl">
              {hero.tagline}
            </p>
            <div data-hero-reveal className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button href={hero.primaryCta.href} size="lg" icon={<ArrowRight size={18} />}>
                {hero.primaryCta.label}
              </Button>
              <Button href={hero.secondaryCta.href} size="lg" variant="secondary" icon={<ArrowUpRight size={18} />}>
                {hero.secondaryCta.label}
              </Button>
            </div>
            {profile.resumeUrl && (
              <a
                data-hero-reveal
                href={profile.resumeUrl.includes('/api/v1/assets/') ? `${profile.resumeUrl}?download=true` : profile.resumeUrl}
                download
                className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-olive"
              >
                <Download size={16} aria-hidden="true" />
                {hero.resumeLabel}
              </a>
            )}
          </div>
        </div>

        {/* Focus strip, in place of the reference's client-logo row */}
        <div data-hero-reveal className="mt-12 text-center">
          <p className="font-serif text-xl text-muted italic">{hero.focusLabel}</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {hero.focusAreas.map((area) => (
              <li key={area} className="flex items-center gap-2 text-sm font-medium text-forest sm:text-base">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-olive" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

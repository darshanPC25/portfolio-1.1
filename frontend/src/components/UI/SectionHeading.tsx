import { cn } from '@/utils/cn'
import { Reveal } from './Reveal'
import { TextReveal } from './TextReveal'
import { useEditables } from '@/editor/editable'

interface SectionHeadingProps {
  /** Section id; the heading gets `${id}-heading` for aria-labelledby. */
  id: string
  eyebrow: string
  heading: string
  intro?: string | null
  align?: 'center' | 'start'
  tone?: 'dark' | 'light'
  className?: string
}

/** Editorial section header: italic serif eyebrow, large heading, optional intro. */
export function SectionHeading({
  id,
  eyebrow,
  heading,
  intro,
  align = 'center',
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  const light = tone === 'light'
  const edit = useEditables()
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' ? 'items-center text-center' : 'items-start', className)}>
      <Reveal>
        <p {...edit(`section.${id}.eyebrow`)} className={cn('font-serif text-lg italic', light ? 'text-sage' : 'text-muted')}>
          <span aria-hidden="true">/ </span>
          {eyebrow}
          <span aria-hidden="true"> /</span>
        </p>
      </Reveal>
      <h2
        id={`${id}-heading`}
        {...edit(`section.${id}.heading`)}
        className={cn(
          'max-w-[18ch] font-heading text-4xl leading-[1.05] font-normal tracking-tight text-balance sm:text-5xl lg:text-6xl',
          light ? 'text-ivory' : 'text-ink',
        )}
      >
        <TextReveal text={heading} delay={0.05} />
      </h2>
      {intro && (
        <Reveal delay={0.2}>
          <p {...edit(`section.${id}.intro`)} className={cn('mt-1 max-w-[52ch] text-base text-pretty sm:text-lg', light ? 'text-mist' : 'text-muted')}>
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  )
}

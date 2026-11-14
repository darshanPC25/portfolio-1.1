import type { SocialLink } from '@/types/content'
import { cn } from '@/utils/cn'
import { SocialIcon } from './BrandIcons'

interface SocialLinksProps {
  links: SocialLink[]
  tone?: 'light' | 'dark'
  className?: string
}

/** Icon links for the social profiles that have a URL. Renders nothing if none do. */
export function SocialLinks({ links, tone = 'light', className }: SocialLinksProps) {
  const available = links.filter((link): link is SocialLink & { url: string } => Boolean(link.url))
  if (available.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {available.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            aria-label={link.label}
            title={link.label}
            {...(link.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={cn(
              'flex size-11 items-center justify-center rounded-full transition-[transform,background-color] duration-300 ease-soft hover:-translate-y-0.5',
              tone === 'light'
                ? 'surface-clay text-forest hover:text-pine'
                : 'border border-ivory/20 bg-ivory/10 text-ivory hover:bg-ivory/20',
            )}
          >
            <SocialIcon platform={link.platform} size={18} />
          </a>
        </li>
      ))}
    </ul>
  )
}

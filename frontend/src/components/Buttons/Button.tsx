import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { isExternalHref } from '@/utils/format'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  children: ReactNode
  className?: string
}

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }

export type ButtonProps = LinkProps | NativeButtonProps

const base =
  'group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight whitespace-nowrap ' +
  'transition-[transform,box-shadow,background-color,color] duration-300 ease-soft ' +
  'hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0'

const variants: Record<Variant, string> = {
  primary: 'bg-linear-to-b from-moss to-forest text-ivory shadow-button hover:from-forest hover:to-pine',
  secondary: 'surface-clay text-forest hover:text-pine',
  ghost: 'text-forest hover:bg-forest/8',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-4 text-sm',
  md: 'min-h-11 px-6 text-[0.95rem]',
  lg: 'min-h-13 px-8 text-base',
}

/** Pill button. Renders an anchor when `href` is given, otherwise a button. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', icon, iconPosition = 'end', children, className, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)
  const content = (
    <>
      {icon && iconPosition === 'start' && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'end' && (
        <span aria-hidden="true" className="transition-transform duration-300 ease-soft group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  )

  if (typeof props.href === 'string') {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    const external = /^https?:/i.test(props.href) && isExternalHref(props.href)
    return (
      <a
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...anchorProps}
      >
        {content}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  )
}

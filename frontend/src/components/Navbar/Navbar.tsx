import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/Buttons/Button'
import { useActiveSection } from '@/hooks/useActiveSection'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/utils/cn'
import { DURATION, EASE_SOFT } from '@/utils/motion'

export function Navbar() {
  const { navigation, profile, hero } = usePortfolioContent()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const active = useActiveSection(navigation.map((item) => item.id))
  const reduceMotion = useReducedMotion()
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const closeOnDesktop = window.matchMedia('(min-width: 1024px)')
    const onChange = () => closeOnDesktop.matches && setMenuOpen(false)
    window.addEventListener('keydown', onKeyDown)
    closeOnDesktop.addEventListener('change', onChange)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      closeOnDesktop.removeEventListener('change', onChange)
    }
  }, [menuOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-10 focus-visible:rounded-full focus-visible:bg-forest focus-visible:px-4 focus-visible:py-2 focus-visible:text-ivory"
      >
        Skip to content
      </a>

      <div
        className={cn(
          'mx-auto flex h-14 w-full max-w-page items-center justify-between rounded-full pr-2 pl-5 transition-[background-color,box-shadow,border-color] duration-500 ease-soft sm:pl-6',
          scrolled || menuOpen
            ? 'border border-white/70 bg-ivory/80 shadow-soft backdrop-blur-md'
            : 'border border-transparent',
        )}
      >
        <a
          href="#home"
          className="font-serif text-2xl leading-none text-forest italic"
          aria-label={`${profile.fullName} — back to top`}
        >
          {profile.preferredName}
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300',
                    active === item.id ? 'bg-forest/10 text-pine' : 'text-moss hover:text-pine',
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button href={hero.primaryCta.href} size="sm" className="hidden sm:inline-flex">
            {hero.primaryCta.label}
          </Button>
          <button
            type="button"
            className="surface-clay flex size-10 items-center justify-center rounded-full text-forest lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id={menuId}
            aria-label="Mobile"
            className="mx-auto mt-2 w-full max-w-page overflow-hidden rounded-card border border-white/70 bg-ivory/95 p-3 shadow-lift backdrop-blur-md lg:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: DURATION.fast, ease: EASE_SOFT }}
          >
            <ul className="flex flex-col">
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={cn(
                      'flex min-h-12 items-center rounded-2xl px-4 text-lg',
                      active === item.id ? 'bg-forest/10 text-pine' : 'text-forest',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

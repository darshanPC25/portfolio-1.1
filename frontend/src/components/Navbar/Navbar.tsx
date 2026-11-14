import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/Buttons/Button'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useHideOnScroll } from '@/hooks/useHideOnScroll'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/utils/cn'
import { DURATION, EASE_SOFT } from '@/utils/motion'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'

const PILL_SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const

const menuList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

const menuItem = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_SOFT } },
}

export function Navbar() {
  const { navigation, profile, hero } = usePortfolioContent()
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const scrolled = useScrolled()
  const hiddenByScroll = useHideOnScroll()
  const active = useActiveSection(navigation.map((item) => item.id))
  const reduceMotion = useMotionDisabled()
  const menuId = useId()

  // Thin reading-progress line along the bottom of the bar.
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  const hidden = hiddenByScroll && !menuOpen && !focusInside

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
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      initial={reduceMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: hidden ? '-130%' : 0, opacity: 1 }}
      transition={{ duration: hidden ? 0.35 : 0.6, ease: EASE_SOFT, delay: 0 }}
      onFocusCapture={() => setFocusInside(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false)
      }}
    >
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-10 focus-visible:rounded-full focus-visible:bg-forest focus-visible:px-4 focus-visible:py-2 focus-visible:text-ivory"
      >
        Skip to content
      </a>

      <div
        className={cn(
          'relative mx-auto flex h-14 w-full max-w-page items-center justify-between overflow-hidden rounded-full pr-2 pl-5 transition-[background-color,box-shadow,border-color] duration-500 ease-soft sm:pl-6',
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
            {navigation.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300',
                      isActive ? 'text-pine' : 'text-moss hover:text-pine',
                    )}
                  >
                    {isActive && (
                      // One shared pill that glides between links as sections change.
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-forest/10"
                        transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
                      />
                    )}
                    {item.label}
                  </a>
                </li>
              )
            })}
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? 'close' : 'open'}
                initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {scrolled && !reduceMotion && (
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress }}
            className="absolute inset-x-6 bottom-0 h-0.5 origin-left rounded-full bg-olive/50"
          />
        )}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id={menuId}
            aria-label="Mobile"
            className="mx-auto mt-2 w-full max-w-page overflow-hidden rounded-card border border-white/70 bg-ivory/95 p-3 shadow-lift backdrop-blur-md lg:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: DURATION.fast, ease: EASE_SOFT }}
          >
            <motion.ul className="flex flex-col" variants={menuList} initial={reduceMotion ? false : 'hidden'} animate="visible">
              {navigation.map((item) => (
                <motion.li key={item.id} variants={menuItem}>
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
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

import { useEffect } from 'react'
import { forDarkTheme, useTheme } from '@/hooks/useTheme'
import type { AppearanceSettings } from '@/types/content'

/** Page background tones offered in Appearance settings. */
const BACKGROUNDS: Record<string, string> = {
  ivory: '#f8f5ec',
  cream: '#f3ecdc',
  mist: '#eef2e4',
}

/** Corner radii (chip, card, panel) per corner style. "soft" is the reference design. */
const CORNERS: Record<string, [string, string, string]> = {
  sharp: ['0.375rem', '0.75rem', '1rem'],
  soft: ['0.75rem', '1.75rem', '2.5rem'],
  round: ['1rem', '2.25rem', '3rem'],
}

const HEX = /^#[0-9a-f]{6}$/i

const TOKENS = [
  '--color-olive',
  '--color-ivory',
  '--color-ink',
  '--font-heading',
  '--font-body',
  '--radius-chip',
  '--radius-card',
  '--radius-panel',
]

/**
 * Applies Appearance settings to the page as design-token overrides, and
 * removes them again on unmount (so the studio keeps its own look).
 * Used by the public site, the editor canvas and the draft preview.
 */
export function useApplyAppearance(appearance: AppearanceSettings | null | undefined) {
  const motionEnabled = appearance?.motionEnabled ?? true
  const accent = appearance?.accentColor
  const backgroundStyle = appearance?.backgroundStyle
  const backgroundColor = appearance?.backgroundColor
  const textColor = appearance?.textColor
  const headingFont = appearance?.headingFont
  const bodyFont = appearance?.bodyFont
  const corners = appearance?.cornerStyle
  const dark = useTheme().theme === 'dark'

  useEffect(() => {
    const root = document.documentElement
    const set = (name: string, value: string | null | undefined) =>
      value ? root.style.setProperty(name, value) : root.style.removeProperty(name)

    root.toggleAttribute('data-reduce-motion', !motionEnabled)
    const accentColor = accent && HEX.test(accent) ? accent : null
    // The accent is lightened for the dark theme; the background and text
    // colours are light-theme choices, so the dark theme keeps its own.
    set('--color-olive', accentColor && dark ? forDarkTheme(accentColor, 60) : accentColor)
    set(
      '--color-ivory',
      dark
        ? null
        : backgroundColor && HEX.test(backgroundColor)
          ? backgroundColor
          : backgroundStyle
            ? BACKGROUNDS[backgroundStyle]
            : null,
    )
    set('--color-ink', !dark && textColor && HEX.test(textColor) ? textColor : null)
    set('--font-heading', headingFont === 'serif' ? 'var(--font-serif)' : null)
    set('--font-body', bodyFont === 'serif' ? 'var(--font-serif)' : null)
    const radii = corners && corners !== 'soft' ? CORNERS[corners] : null
    set('--radius-chip', radii?.[0])
    set('--radius-card', radii?.[1])
    set('--radius-panel', radii?.[2])

    return () => {
      root.removeAttribute('data-reduce-motion')
      TOKENS.forEach((token) => root.style.removeProperty(token))
    }
  }, [motionEnabled, accent, backgroundStyle, backgroundColor, textColor, headingFont, bodyFont, corners, dark])
}

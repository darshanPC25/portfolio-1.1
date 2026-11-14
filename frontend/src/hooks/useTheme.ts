import { useCallback, useSyncExternalStore } from 'react'

/**
 * Light / dark colour theme for the public site and Portfolio Studio.
 *
 * The choice is per visitor (localStorage), defaults to the brand's light
 * theme, and is applied as `data-theme` on <html>. public/theme-init.js sets
 * it before the first paint; this module keeps it in sync afterwards,
 * including across tabs and the visual editor's canvas frame.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'portfolio-theme'
const THEME_COLORS: Record<Theme, string> = {
  light: '#f8f5ec',
  dark: '#11160e',
}

function read(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function apply(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Another tab, or the parent/child frame of the visual editor, changed it.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    apply(event.newValue === 'dark' ? 'dark' : 'light')
    notify()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function setTheme(theme: Theme) {
  apply(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
  notify()
}

/** The current theme and a toggle. Re-renders when the theme changes anywhere. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme)
  const toggle = useCallback(() => setTheme(read() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}

/**
 * A colour picked for the light theme, made readable on the dark background
 * by mixing it toward the dark theme's text colour while keeping its hue.
 */
export function forDarkTheme(color: string, amount = 45): string {
  return `color-mix(in oklab, ${color} ${amount}%, #ebe8dc)`
}

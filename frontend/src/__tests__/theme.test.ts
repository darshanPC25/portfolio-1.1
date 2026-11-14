import { describe, expect, it } from 'vitest'
import { styleToCss } from '@/editor/editable'
import { forDarkTheme } from '@/hooks/useTheme'

describe('dark theme colours', () => {
  it('mixes a light-theme colour toward the dark theme text colour, keeping its hue', () => {
    expect(forDarkTheme('#3a4f25')).toBe('color-mix(in oklab, #3a4f25 45%, #ebe8dc)')
    expect(forDarkTheme('#6f8446', 60)).toBe('color-mix(in oklab, #6f8446 60%, #ebe8dc)')
  })

  it('keeps per-element colours as chosen in light and lightens them in dark', () => {
    const style = { color: '#3a4f25', fontWeight: 600 } as never
    expect(styleToCss(style)).toEqual({ color: '#3a4f25', fontWeight: 600 })
    expect(styleToCss(style, true)).toEqual({
      color: forDarkTheme('#3a4f25'),
      fontWeight: 600,
    })
  })
})

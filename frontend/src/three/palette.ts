/** Material colours for the 3D scene, matched to the CSS design tokens. */
export const SCENE_COLORS = {
  sage: '#b4c597',
  fern: '#93a974',
  olive: '#6f8446',
  moss: '#566b35',
  cream: '#efe7d2',
  sand: '#e2d6b8',
  shadow: '#26361a',
} as const

/** Deterministic pseudo-random generator, so the layout is the same on every visit. */
export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

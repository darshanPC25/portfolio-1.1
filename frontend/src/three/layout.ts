import { SCENE_COLORS as C, seededRandom } from './palette'

/** One large, slowly morphing sculptural form. */
export interface FormSpec {
  /** Horizontal position, -1 (left edge) to 1 (right edge) of the viewport. */
  fx: number
  /** Vertical position, -1 (bottom) to 1 (top). */
  fy: number
  z: number
  size: number
  stretch: [number, number, number]
  color: string
  distort: number
  /** Radians per second of slow self-rotation. */
  spin: number
}

/** A solid sphere: a "pebble" or a tiny floating particle. */
export interface PebbleSpec {
  fx: number
  fy: number
  z: number
  size: number
  color: string
}

/* Composition mirrors the reference: large forms in the corners and behind
   the portrait, small spheres scattered between them. */
export const WIDE_FORMS: FormSpec[] = [
  { fx: -0.8, fy: 0.62, z: -1.5, size: 1.5, stretch: [1.15, 0.95, 1], color: C.sage, distort: 0.42, spin: 0.08 },
  { fx: 0.96, fy: 0.7, z: -1, size: 1.3, stretch: [1, 1.1, 1], color: C.olive, distort: 0.4, spin: -0.07 },
  { fx: -0.26, fy: -0.22, z: -2, size: 1.25, stretch: [1.1, 1.25, 1], color: C.fern, distort: 0.45, spin: 0.06 },
  { fx: 0.3, fy: -0.42, z: -2.5, size: 1.2, stretch: [1.3, 0.95, 1], color: C.moss, distort: 0.4, spin: -0.05 },
  { fx: 0.95, fy: -0.62, z: -0.5, size: 1.05, stretch: [1, 1, 1], color: C.sage, distort: 0.36, spin: 0.09 },
]

export const WIDE_PEBBLES: PebbleSpec[] = [
  { fx: -0.93, fy: -0.6, z: 0, size: 0.62, color: C.cream },
  { fx: 0.97, fy: 0.0, z: 0.5, size: 0.4, color: C.cream },
  { fx: 0.82, fy: 0.2, z: 0.5, size: 0.18, color: C.olive },
  { fx: -0.46, fy: 0.3, z: 0.5, size: 0.16, color: C.fern },
  { fx: 0.16, fy: 0.84, z: 0, size: 0.13, color: C.cream },
  { fx: -0.6, fy: -0.8, z: 0.5, size: 0.22, color: C.olive },
]

/* Portrait screens: the forms hug the edges so the stacked text in the
   middle always sits on a calm background. */
export const NARROW_FORMS: FormSpec[] = [
  { fx: -1.05, fy: 0.6, z: -1, size: 1.3, stretch: [1.1, 0.95, 1], color: C.sage, distort: 0.4, spin: 0.08 },
  { fx: 1.1, fy: 0.3, z: -1, size: 1.15, stretch: [1, 1.15, 1], color: C.olive, distort: 0.4, spin: -0.07 },
  { fx: -1.1, fy: -0.3, z: -1.5, size: 1.05, stretch: [1, 1.2, 1], color: C.fern, distort: 0.42, spin: 0.06 },
  { fx: 1.1, fy: -0.72, z: -1, size: 1.1, stretch: [1, 1, 1], color: C.sage, distort: 0.38, spin: -0.05 },
]

export const NARROW_PEBBLES: PebbleSpec[] = [
  { fx: -0.9, fy: -0.9, z: 0, size: 0.5, color: C.cream },
  { fx: 0.98, fy: -0.22, z: 0.5, size: 0.3, color: C.cream },
  { fx: 0.72, fy: 0.9, z: 0.5, size: 0.16, color: C.olive },
  { fx: -0.8, fy: 0.12, z: 0.5, size: 0.14, color: C.fern },
]

const PARTICLE_COLORS = [C.cream, C.sand, C.sage, C.fern, C.olive]

/**
 * Tiny floating spheres scattered around the edges of the scene, avoiding
 * the areas where text and the portrait sit.
 */
export function createParticles(count: number, seed = 7): PebbleSpec[] {
  const random = seededRandom(seed)
  const particles: PebbleSpec[] = []
  while (particles.length < count) {
    const fx = random() * 2 - 1
    const fy = random() * 2 - 1
    // Keep clear of the content band: headline, portrait and both text columns.
    const overContent = Math.abs(fy) < 0.62 && Math.abs(fx) < 0.92
    const overHeadline = fy > 0.1 && Math.abs(fx) < 0.7
    if (overContent || overHeadline) continue
    particles.push({
      fx,
      fy,
      z: -1.5 + random() * 2.5,
      size: 0.035 + random() * 0.05,
      color: PARTICLE_COLORS[Math.floor(random() * PARTICLE_COLORS.length)],
    })
  }
  return particles
}

/** Particle counts per device tier. */
export const PARTICLE_COUNT = { high: 18, low: 7 } as const

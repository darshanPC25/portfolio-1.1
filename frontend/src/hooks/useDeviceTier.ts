import { useState } from 'react'

/**
 * Rendering budget for the current device.
 *
 * - high: desktop-class GPU and a fine pointer. Full geometry, soft shadows,
 *   more floating spheres, higher pixel ratio.
 * - low: phones, tablets and modest laptops. Lighter geometry, no shadow
 *   pass, fewer spheres, capped pixel ratio.
 */
export type DeviceTier = 'high' | 'low'

interface DeviceHints {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

function hints(): Navigator & DeviceHints {
  return navigator as Navigator & DeviceHints
}

export function getDeviceTier(): DeviceTier {
  const nav = hints()
  const narrow = window.matchMedia('(max-width: 767px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const lowMemory = (nav.deviceMemory ?? 8) <= 4
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4
  return narrow || coarse || lowMemory || fewCores ? 'low' : 'high'
}

/**
 * True when the device should not run WebGL at all: the visitor asked to
 * save data, or the hardware is very constrained. The CSS shapes are shown
 * instead.
 */
export function prefersStaticVisuals(): boolean {
  const nav = hints()
  return Boolean(nav.connection?.saveData) || (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2
}

/** Device tier, decided once per page load. */
export function useDeviceTier(): DeviceTier {
  const [tier] = useState(getDeviceTier)
  return tier
}

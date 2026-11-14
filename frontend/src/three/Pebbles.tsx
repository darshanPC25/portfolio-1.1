import { Instance, Instances } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type RefObject, useRef } from 'react'
import { type Group, MathUtils } from 'three'
import type { PebbleSpec } from './layout'
import { type Pointer, parallaxDepth } from './OrganicBlob'
import { clamp01, easeOutCubic } from './palette'

interface PebbleProps {
  spec: PebbleSpec
  index: number
  position: [number, number, number]
  radius: number
  pointer: RefObject<Pointer>
  animate: boolean
}

function Pebble({ spec, index, position, radius, pointer, animate }: PebbleProps) {
  const ref = useRef<Group>(null)

  useFrame((state, delta) => {
    const item = ref.current
    if (!item) return
    const t = state.clock.elapsedTime
    const intro = easeOutCubic(clamp01((t - 0.5 - index * 0.04) / 1.2))
    const depth = parallaxDepth(spec.z) * 1.2
    const bob = Math.sin(t * 0.8 + index * 2.3) * radius * 0.6 + Math.sin(t * 0.35 + index) * 0.1

    item.scale.setScalar(radius * intro)
    item.position.x = MathUtils.damp(item.position.x, position[0] + pointer.current.x * depth, 2, delta)
    item.position.y = MathUtils.damp(item.position.y, position[1] - pointer.current.y * depth + bob, 2, delta)
  })

  return <Instance ref={ref} position={position} scale={animate ? 0 : radius} color={spec.color} />
}

interface PebblesProps {
  items: { spec: PebbleSpec; position: [number, number, number]; radius: number }[]
  segments: number
  pointer: RefObject<Pointer>
  animate: boolean
  castShadow: boolean
}

/**
 * Every solid sphere in the scene (pebbles and particles) drawn with one
 * instanced mesh, so they cost a single draw call.
 */
export function Pebbles({ items, segments, pointer, animate, castShadow }: PebblesProps) {
  return (
    <Instances limit={items.length} range={items.length} castShadow={castShadow}>
      <sphereGeometry args={[1, segments, segments]} />
      <meshStandardMaterial roughness={0.72} metalness={0} envMapIntensity={0.6} />
      {items.map((item, index) => (
        <Pebble key={index} index={index} pointer={pointer} animate={animate} {...item} />
      ))}
    </Instances>
  )
}

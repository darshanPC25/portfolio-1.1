import { MeshDistortMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type RefObject, useRef } from 'react'
import { type BufferGeometry, type Group, MathUtils, type Mesh } from 'three'
import type { FormSpec } from './layout'
import { clamp01, easeOutCubic } from './palette'

export interface Pointer {
  x: number
  y: number
}

interface OrganicBlobProps {
  spec: FormSpec
  index: number
  /** World-space position derived from the spec and the current viewport. */
  position: [number, number, number]
  radius: number
  geometry: BufferGeometry
  pointer: RefObject<Pointer>
  animate: boolean
  castShadow: boolean
}

/** How far an object at depth z follows the pointer: nearer objects move more. */
export const parallaxDepth = (z: number) => 0.22 + (z + 3) * 0.12

/**
 * Matte, clay-like sculptural form. It grows in on load, breathes (surface
 * distortion), turns slowly, bobs, and leans toward the pointer.
 */
export function OrganicBlob({ spec, index, position, radius, geometry, pointer, animate, castShadow }: OrganicBlobProps) {
  const group = useRef<Group>(null)
  const mesh = useRef<Mesh>(null)

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const intro = easeOutCubic(clamp01((t - 0.25 - index * 0.09) / 1.5))
    const depth = parallaxDepth(spec.z)
    const bob = Math.sin(t * 0.55 + index * 1.7) * 0.12

    g.scale.setScalar(intro)
    g.position.x = MathUtils.damp(g.position.x, position[0] + pointer.current.x * depth, 2.4, delta)
    g.position.y = MathUtils.damp(g.position.y, position[1] - pointer.current.y * depth + bob, 2.4, delta)

    if (mesh.current) {
      mesh.current.rotation.y += delta * spec.spin
      mesh.current.rotation.x += delta * spec.spin * 0.4
    }
  })

  return (
    <group ref={group} position={position} scale={animate ? 0 : 1}>
      <mesh
        ref={mesh}
        geometry={geometry}
        scale={[radius * spec.stretch[0], radius * spec.stretch[1], radius * spec.stretch[2]]}
        rotation={[0, 0, index * 0.7]}
        castShadow={castShadow}
      >
        <MeshDistortMaterial
          color={spec.color}
          distort={spec.distort}
          speed={animate ? 1 + (index % 3) * 0.25 : 0}
          roughness={0.82}
          metalness={0}
          sheen={0.5}
          sheenRoughness={0.8}
          sheenColor="#fffaf0"
          envMapIntensity={0.55}
        />
      </mesh>
    </group>
  )
}

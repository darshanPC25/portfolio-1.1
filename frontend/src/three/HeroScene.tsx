import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { OrganicBlob } from './OrganicBlob'

const SAGE = '#b4c597'
const FERN = '#93a974'
const OLIVE = '#6f8446'
const MOSS = '#566b35'
const CREAM = '#efe7d2'

interface BlobSpec {
  /** Horizontal position, -1 (left edge) to 1 (right edge) of the viewport. */
  fx: number
  /** Vertical position, -1 (bottom) to 1 (top). */
  fy: number
  z: number
  /** Base radius in world units before responsive scaling. */
  size: number
  stretch: [number, number, number]
  color: string
  distort: number
}

/* Composition mirrors the reference: large forms in the corners and behind
   the portrait, small spheres scattered between them. */
const WIDE_LAYOUT: BlobSpec[] = [
  { fx: -0.8, fy: 0.62, z: -1.5, size: 1.5, stretch: [1.15, 0.95, 1], color: SAGE, distort: 0.42 },
  { fx: 0.96, fy: 0.7, z: -1, size: 1.3, stretch: [1, 1.1, 1], color: OLIVE, distort: 0.4 },
  { fx: -0.26, fy: -0.22, z: -2, size: 1.25, stretch: [1.1, 1.25, 1], color: FERN, distort: 0.45 },
  { fx: 0.3, fy: -0.42, z: -2.5, size: 1.2, stretch: [1.3, 0.95, 1], color: MOSS, distort: 0.4 },
  { fx: 0.95, fy: -0.62, z: -0.5, size: 1.05, stretch: [1, 1, 1], color: SAGE, distort: 0.36 },
  { fx: -0.93, fy: -0.6, z: 0, size: 0.62, stretch: [1, 1, 1], color: CREAM, distort: 0 },
  { fx: 0.97, fy: 0.0, z: 0.5, size: 0.4, stretch: [1, 1, 1], color: CREAM, distort: 0 },
  { fx: 0.82, fy: 0.2, z: 0.5, size: 0.18, stretch: [1, 1, 1], color: OLIVE, distort: 0 },
  { fx: -0.46, fy: 0.3, z: 0.5, size: 0.16, stretch: [1, 1, 1], color: FERN, distort: 0 },
  { fx: 0.16, fy: 0.84, z: 0, size: 0.13, stretch: [1, 1, 1], color: CREAM, distort: 0 },
  { fx: -0.6, fy: -0.8, z: 0.5, size: 0.22, stretch: [1, 1, 1], color: OLIVE, distort: 0 },
]

/* Portrait screens: the forms hug the edges and stay light in tone, so the
   stacked text in the middle always sits on a calm background. */
const NARROW_LAYOUT: BlobSpec[] = [
  { fx: -1.05, fy: 0.6, z: -1, size: 1.3, stretch: [1.1, 0.95, 1], color: SAGE, distort: 0.4 },
  { fx: 1.1, fy: 0.3, z: -1, size: 1.15, stretch: [1, 1.15, 1], color: OLIVE, distort: 0.4 },
  { fx: -1.1, fy: -0.3, z: -1.5, size: 1.05, stretch: [1, 1.2, 1], color: FERN, distort: 0.42 },
  { fx: 1.1, fy: -0.72, z: -1, size: 1.1, stretch: [1, 1, 1], color: SAGE, distort: 0.38 },
  { fx: -0.9, fy: -0.9, z: 0, size: 0.5, stretch: [1, 1, 1], color: CREAM, distort: 0 },
  { fx: 0.98, fy: -0.22, z: 0.5, size: 0.3, stretch: [1, 1, 1], color: CREAM, distort: 0 },
  { fx: 0.72, fy: 0.9, z: 0.5, size: 0.16, stretch: [1, 1, 1], color: OLIVE, distort: 0 },
  { fx: -0.8, fy: 0.12, z: 0.5, size: 0.14, stretch: [1, 1, 1], color: FERN, distort: 0 },
]

function Blobs({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  useEffect(() => {
    if (!animate) return
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [animate])

  useFrame((_, delta) => {
    if (!group.current || !animate) return
    const ease = Math.min(1, delta * 2)
    group.current.rotation.y += (pointer.current.x * 0.06 - group.current.rotation.y) * ease
    group.current.rotation.x += (pointer.current.y * 0.04 - group.current.rotation.x) * ease
  })

  const halfWidth = viewport.width / 2
  const halfHeight = viewport.height / 2
  // Shrink the forms on narrow screens so they frame the content instead of covering it.
  const responsive = Math.min(1, Math.max(0.5, viewport.width / 10))

  const layout = viewport.width < 6 ? NARROW_LAYOUT : WIDE_LAYOUT

  return (
    <group ref={group}>
      {layout.map((blob, index) => {
        const radius = blob.size * responsive
        return (
          <OrganicBlob
            key={index}
            position={[blob.fx * halfWidth, blob.fy * halfHeight, blob.z]}
            scale={[radius * blob.stretch[0], radius * blob.stretch[1], radius * blob.stretch[2]]}
            color={blob.color}
            distort={blob.distort}
            speed={animate ? 1.1 + (index % 3) * 0.25 : 0}
            floatIntensity={blob.size > 0.5 ? 0.6 : 1.4}
            rotation={[0, 0, index * 0.7]}
          />
        )
      })}
    </group>
  )
}

interface HeroSceneProps {
  /** Run the render loop. False when off screen or under reduced motion. */
  animate: boolean
}

/** WebGL backdrop for the hero: floating matte blobs and spheres. */
export default function HeroScene({ animate }: HeroSceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 10], fov: 35 }}
      dpr={[1, 1.5]}
      frameloop={animate ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.5} />
      <hemisphereLight args={['#fffdf4', '#7f9559', 1.4]} />
      <directionalLight position={[-4, 7, 6]} intensity={2.4} color="#fff8e6" />
      <directionalLight position={[6, -3, 4]} intensity={0.5} color="#dfe9cc" />
      <Blobs animate={animate} />
    </Canvas>
  )
}

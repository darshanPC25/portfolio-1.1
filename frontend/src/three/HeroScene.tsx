import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type Group, MathUtils, SphereGeometry } from 'three'
import type { DeviceTier } from '@/hooks/useDeviceTier'
import { createParticles, NARROW_FORMS, NARROW_PEBBLES, PARTICLE_COUNT, WIDE_FORMS, WIDE_PEBBLES } from './layout'
import { OrganicBlob, type Pointer } from './OrganicBlob'
import { clamp01 } from './palette'
import { Pebbles } from './Pebbles'
import { SceneLighting } from './SceneLighting'

/** Rendering settings per device tier. */
const QUALITY = {
  high: { formSegments: 64, pebbleSegments: 24, dpr: 1.75, envResolution: 128, shadows: true, antialias: true },
  low: { formSegments: 40, pebbleSegments: 16, dpr: 1.25, envResolution: 64, shadows: false, antialias: false },
} as const

interface SceneProps {
  animate: boolean
  tier: DeviceTier
}

function Scene({ animate, tier }: SceneProps) {
  const quality = QUALITY[tier]
  const root = useRef<Group>(null)
  const pointer = useRef<Pointer>({ x: 0, y: 0 })
  const { viewport, camera } = useThree()

  // Track the pointer over the whole window (the canvas itself ignores pointer events).
  useEffect(() => {
    if (!animate) return
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [animate])

  // Smooth group tilt toward the pointer and a gentle camera drift on scroll,
  // which separates the near and far forms (depth through parallax).
  useFrame((_, delta) => {
    const group = root.current
    if (!group) return
    const scroll = clamp01(window.scrollY / window.innerHeight)
    group.rotation.y = MathUtils.damp(group.rotation.y, pointer.current.x * 0.08, 2, delta)
    group.rotation.x = MathUtils.damp(group.rotation.x, pointer.current.y * 0.05 + scroll * 0.12, 2, delta)
    camera.position.y = MathUtils.damp(camera.position.y, -scroll * 2.2, 4, delta)
    camera.position.z = MathUtils.damp(camera.position.z, 10 + scroll * 1.5, 4, delta)
  })

  // One shared, appropriately detailed geometry for every morphing form.
  const formGeometry = useMemo(
    () => new SphereGeometry(1, quality.formSegments, quality.formSegments),
    [quality.formSegments],
  )
  useEffect(() => () => formGeometry.dispose(), [formGeometry])

  const narrow = viewport.width < 6
  const forms = narrow ? NARROW_FORMS : WIDE_FORMS
  const halfWidth = viewport.width / 2
  const halfHeight = viewport.height / 2
  // Shrink the forms on narrow screens so they frame the content instead of covering it.
  const responsive = Math.min(1, Math.max(0.5, viewport.width / 10))

  const pebbles = useMemo(() => {
    const specs = [...(narrow ? NARROW_PEBBLES : WIDE_PEBBLES), ...createParticles(PARTICLE_COUNT[tier])]
    return specs.map((spec) => ({
      spec,
      position: [spec.fx * halfWidth, spec.fy * halfHeight, spec.z] as [number, number, number],
      radius: spec.size * responsive,
    }))
  }, [narrow, tier, halfWidth, halfHeight, responsive])

  return (
    <>
      <SceneLighting shadows={quality.shadows} envResolution={quality.envResolution} />
      <group ref={root}>
        {forms.map((spec, index) => (
          <OrganicBlob
            key={`${narrow ? 'n' : 'w'}-${index}`}
            spec={spec}
            index={index}
            position={[spec.fx * halfWidth, spec.fy * halfHeight, spec.z]}
            radius={spec.size * responsive}
            geometry={formGeometry}
            pointer={pointer}
            animate={animate}
            castShadow={quality.shadows}
          />
        ))}
        <Pebbles
          items={pebbles}
          segments={quality.pebbleSegments}
          pointer={pointer}
          animate={animate}
          castShadow={quality.shadows}
        />
      </group>
    </>
  )
}

interface HeroSceneProps {
  /** Run the render loop. False when off screen or under reduced motion. */
  animate: boolean
  tier: DeviceTier
  /** Called once the WebGL context exists and the first frame is drawn. */
  onReady?: () => void
}

/** WebGL backdrop for the hero: floating matte sculptural forms and spheres. */
export default function HeroScene({ animate, tier, onReady }: HeroSceneProps) {
  const quality = QUALITY[tier]
  const [dpr, setDpr] = useState<number>(quality.dpr)

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 10], fov: 35 }}
      dpr={[1, dpr]}
      shadows={quality.shadows ? 'variance' : false}
      frameloop={animate ? 'always' : 'demand'}
      gl={{ antialias: quality.antialias, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      {/* Drop the pixel ratio if the device cannot hold a smooth frame rate. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Scene animate={animate} tier={tier} />
    </Canvas>
  )
}

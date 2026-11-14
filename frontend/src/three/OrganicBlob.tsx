import { Float, MeshDistortMaterial } from '@react-three/drei'

export interface OrganicBlobProps {
  position: [number, number, number]
  /** Per-axis scale; unequal values give the stretched, sculpted look. */
  scale: [number, number, number]
  color: string
  /** 0 keeps a perfect sphere; ~0.4 is a soft organic form. */
  distort?: number
  /** Set to 0 to freeze the surface (reduced motion). */
  speed?: number
  floatIntensity?: number
  rotation?: [number, number, number]
}

/** Matte, clay-like sculptural form that slowly breathes and floats. */
export function OrganicBlob({
  position,
  scale,
  color,
  distort = 0.38,
  speed = 1.2,
  floatIntensity = 0.8,
  rotation = [0, 0, 0],
}: OrganicBlobProps) {
  return (
    <Float
      speed={speed === 0 ? 0 : 1.1}
      rotationIntensity={0.35}
      floatIntensity={floatIntensity}
      floatingRange={[-0.12, 0.12]}
    >
      <mesh position={position} scale={scale} rotation={rotation}>
        <sphereGeometry args={[1, 72, 72]} />
        <MeshDistortMaterial color={color} distort={distort} speed={speed} roughness={0.92} metalness={0} />
      </mesh>
    </Float>
  )
}

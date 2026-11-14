import { Environment, Lightformer } from '@react-three/drei'
import { useTheme } from '@/hooks/useTheme'
import { SCENE_COLORS } from './palette'

interface SceneLightingProps {
  shadows: boolean
  envResolution: number
}

/**
 * Soft studio lighting. A warm key light from the upper left casts the soft
 * shadows; a locally built environment (no network HDR file) gives the
 * matte surfaces gentle, realistic falloff.
 */
export function SceneLighting({ shadows, envResolution }: SceneLightingProps) {
  // Night lighting: dimmer and cooler, so the forms glow softly on the dark page.
  const dark = useTheme().theme === 'dark'
  const k = dark ? 0.4 : 1
  return (
    <>
      <ambientLight intensity={0.55 * k} />
      <hemisphereLight args={[dark ? '#dfe9cc' : '#fffdf4', dark ? '#26361a' : '#7f9559', 0.9 * k]} />
      {/* Key light: shapes the forms from the upper left. */}
      <directionalLight position={[-4, 7, 6]} intensity={1.9 * k} color="#fff6e2" />
      {/* Near-frontal light that only exists to cast soft shadows close
          beneath each form onto the backdrop, as in the reference. */}
      <directionalLight
        position={[-2, 4, 10]}
        intensity={0.45}
        color="#fff6e2"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-radius={10}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-12, 12, 9, -9, 0.5, 30]} />
      </directionalLight>
      <directionalLight position={[6, -3, 4]} intensity={0.45 * k} color="#dfe9cc" />

      <Environment key={dark ? 'dark' : 'light'} resolution={envResolution} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2 * k}
          color="#fffaf0"
          position={[0, 6, 2]}
          rotation-x={Math.PI / 2}
          scale={[12, 6, 1]}
        />
        <Lightformer form="circle" intensity={1.4 * k} color="#e3ead4" position={[-6, 1, 4]} scale={5} />
        <Lightformer form="rect" intensity={0.7 * k} color="#f1ebdb" position={[6, -1, 3]} scale={[4, 7, 1]} />
      </Environment>

      {shadows && (
        // Invisible backdrop that only shows the shadows the forms cast on it.
        <mesh position={[0, 0, -4]} receiveShadow>
          <planeGeometry args={[60, 40]} />
          <shadowMaterial transparent opacity={0.22} color={SCENE_COLORS.shadow} />
        </mesh>
      )}
    </>
  )
}

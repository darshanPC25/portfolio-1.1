import { lazy, Suspense, useRef, useState } from 'react'
import { Blob } from '@/components/UI/Blob'
import { prefersStaticVisuals, useDeviceTier } from '@/hooks/useDeviceTier'
import { useInViewport } from '@/hooks/useInViewport'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'
import { SceneBoundary } from '@/three/SceneBoundary'
import { isWebGLAvailable } from '@/three/webgl'
import { cn } from '@/utils/cn'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'

// Three.js is the heaviest dependency, so it loads after first paint.
const HeroScene = lazy(() => import('@/three/HeroScene'))

/**
 * CSS-only version of the scene. It paints immediately, stays as the
 * fallback when WebGL is unavailable, and fades out once the 3D scene is up.
 */
function StaticBlobs({ hidden }: { hidden: boolean }) {
  return (
    <div className={cn('absolute inset-0 transition-opacity duration-1000 ease-soft', hidden && 'opacity-0')}>
      <Blob tone="sage" parallax={0} className="top-[6%] left-[-8%] size-[38vw] max-h-96 max-w-96" />
      <Blob tone="olive" parallax={0} className="top-[4%] right-[-9%] size-[32vw] max-h-80 max-w-80" />
      <Blob tone="sage" parallax={0} className="right-[-6%] bottom-[4%] size-[26vw] max-h-64 max-w-64" />
      <Blob tone="cream" round parallax={0} className="bottom-[10%] left-[-3%] size-[16vw] max-h-40 max-w-40" />
    </div>
  )
}

/** Decorative layer behind the hero content. */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInViewport(ref)
  const reduceMotion = useMotionDisabled()
  const tier = useDeviceTier()
  const [sceneReady, setSceneReady] = useState(false)
  const { appearance } = usePortfolioContent()
  const [deviceCanRender3D] = useState(() => isWebGLAvailable() && !prefersStaticVisuals())
  const use3D = appearance.heroSceneEnabled && deviceCanRender3D

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <StaticBlobs hidden={use3D && sceneReady} />
      {use3D && (
        <SceneBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className={cn('absolute inset-0 transition-opacity duration-700', sceneReady ? 'opacity-100' : 'opacity-0')}>
              <HeroScene animate={inView && !reduceMotion} tier={tier} onReady={() => setSceneReady(true)} />
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  )
}

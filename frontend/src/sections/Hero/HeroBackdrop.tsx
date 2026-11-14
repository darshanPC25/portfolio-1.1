import { useReducedMotion } from 'framer-motion'
import { lazy, Suspense, useRef } from 'react'
import { Blob } from '@/components/UI/Blob'
import { useInViewport } from '@/hooks/useInViewport'
import { SceneBoundary } from '@/three/SceneBoundary'
import { isWebGLAvailable } from '@/three/webgl'

// Three.js is the heaviest dependency, so it loads after first paint.
const HeroScene = lazy(() => import('@/three/HeroScene'))

/** CSS-only version of the scene, shown while WebGL loads or when it is unavailable. */
function StaticBlobs() {
  return (
    <>
      <Blob tone="sage" drift="none" className="top-[6%] left-[-8%] size-[38vw] max-h-96 max-w-96" />
      <Blob tone="olive" drift="none" className="top-[4%] right-[-9%] size-[32vw] max-h-80 max-w-80" />
      <Blob tone="sage" drift="none" className="right-[-6%] bottom-[4%] size-[26vw] max-h-64 max-w-64" />
      <Blob tone="cream" round drift="none" className="bottom-[10%] left-[-3%] size-[16vw] max-h-40 max-w-40" />
    </>
  )
}

/** Decorative layer behind the hero content. */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInViewport(ref)
  const reduceMotion = useReducedMotion()
  const fallback = <StaticBlobs />

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {isWebGLAvailable() ? (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <HeroScene animate={inView && !reduceMotion} />
          </Suspense>
        </SceneBoundary>
      ) : (
        fallback
      )}
    </div>
  )
}

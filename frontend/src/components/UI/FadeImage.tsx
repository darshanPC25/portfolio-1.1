import { type ImgHTMLAttributes, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

/**
 * Image that eases in from a soft blur and slight zoom once it has loaded,
 * instead of popping in. Replacing `src` (for example from the CMS later)
 * plays the transition again.
 */
export function FadeImage({ className, onLoad, src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(Boolean(ref.current?.complete && ref.current.naturalWidth > 0))
  }, [src])

  return (
    <img
      ref={ref}
      src={src}
      {...props}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      className={cn(
        'transition-[opacity,filter,scale] duration-[900ms] ease-soft motion-reduce:transition-none',
        loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.04] opacity-0 blur-md',
        className,
      )}
    />
  )
}

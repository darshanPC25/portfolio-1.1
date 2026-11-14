import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'

/**
 * True while the visitor is scrolling down past `offset` pixels; false as
 * soon as they scroll back up or return near the top.
 */
export function useHideOnScroll(offset = 480) {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, 'change', (current) => {
    const delta = current - (scrollY.getPrevious() ?? 0)
    if (current < offset) setHidden(false)
    else if (delta > 8) setHidden(true)
    else if (delta < -8) setHidden(false)
  })

  return hidden
}

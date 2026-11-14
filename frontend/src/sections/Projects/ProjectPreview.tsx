import { motion } from 'framer-motion'
import { FadeImage } from '@/components/UI/FadeImage'
import type { Project } from '@/types/content'
import { cn } from '@/utils/cn'
import { EASE_SOFT, VIEWPORT_ONCE } from '@/utils/motion'
import { useMotionDisabled } from '@/hooks/useMotionDisabled'
import { useEditables } from '@/editor/editable'

interface ProjectPreviewProps {
  project: Project
  /** Editor id of the image (cards only; not the details dialog). */
  editId?: string
  /** Load immediately instead of lazily (for images near the top of a dialog). */
  eager?: boolean
  className?: string
}

/**
 * Project image inside the rounded device-style frame used in the reference.
 * The screen opens from a soft inset when it first scrolls into view, the
 * image fades in when loaded, and it zooms gently on card hover.
 */
export function ProjectPreview({ project, editId, eager = false, className }: ProjectPreviewProps) {
  const edit = useEditables()
  const reduceMotion = useMotionDisabled()

  return (
    <div
      {...(editId ? edit(editId) : {})}
      className={cn('rounded-[1.4rem] border border-white/80 bg-sand/60 p-2 shadow-soft', className)}
    >
      <motion.div
        className="aspect-[16/10] overflow-hidden rounded-2xl bg-cream"
        initial={reduceMotion ? false : { clipPath: 'inset(10% 10% 10% 10% round 16px)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 16px)' }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 1.1, ease: EASE_SOFT }}
      >
        {project.imageUrl && (
          <FadeImage
            src={project.imageUrl}
            alt={project.imageAlt}
            width={800}
            height={500}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="size-full object-cover group-hover:scale-[1.04] group-hover/tilt:scale-[1.04]"
          />
        )}
      </motion.div>
    </div>
  )
}

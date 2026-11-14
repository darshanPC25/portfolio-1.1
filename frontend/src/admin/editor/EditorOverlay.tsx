import { Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Box {
  top: number
  left: number
  width: number
  height: number
}

interface EditorOverlayProps {
  /** Edit mode: outline and select elements. Otherwise only navigation is guarded. */
  enabled: boolean
  selectedId: string | null
  describe: (id: string) => string
  onSelect: (id: string) => void
}

const selectorFor = (id: string) => `[data-edit-id="${CSS.escape(id)}"]`

function measure(id: string | null): Box[] {
  if (!id) return []
  return [...document.querySelectorAll(selectorFor(id))]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => ({ top: r.top, left: r.left, width: r.width, height: r.height }))
}

const same = (a: Box[], b: Box[]) =>
  a.length === b.length && a.every((x, i) => x.top === b[i].top && x.left === b[i].left && x.width === b[i].width && x.height === b[i].height)

/**
 * Draws the hover outline, label badge and selection on top of the real site
 * inside the editor canvas. Elements are found by `data-edit-id`; nothing is
 * wrapped, so the page layout is untouched. Also stops links from leaving the
 * page and forms from submitting while editing or previewing a draft.
 */
export function EditorOverlay({ enabled, selectedId, describe, onSelect }: EditorOverlayProps) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [hoverBoxes, setHoverBoxes] = useState<Box[]>([])
  const [selectedBoxes, setSelectedBoxes] = useState<Box[]>([])
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    const editableFrom = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>('[data-edit-id]') : null

    const onOver = (event: MouseEvent) => {
      if (!enabled) return
      setHoverId(editableFrom(event.target)?.dataset.editId ?? null)
    }
    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) setHoverId(null)
    }
    const onClick = (event: MouseEvent) => {
      const editable = enabled ? editableFrom(event.target) : null
      if (editable) {
        event.preventDefault()
        event.stopPropagation()
        onSelectRef.current(editable.dataset.editId!)
        return
      }
      // Keep the canvas on the page: allow in-page anchors only.
      const link = event.target instanceof Element ? event.target.closest('a') : null
      if (link && !(link.getAttribute('href') ?? '').startsWith('#')) event.preventDefault()
    }
    const onKey = (event: KeyboardEvent) => {
      if (!enabled || (event.key !== 'Enter' && event.key !== ' ')) return
      const editable = editableFrom(event.target)
      if (editable && editable === event.target) {
        event.preventDefault()
        onSelectRef.current(editable.dataset.editId!)
      }
    }
    const onSubmit = (event: Event) => event.preventDefault()

    document.addEventListener('mouseover', onOver, true)
    document.addEventListener('mouseout', onOut, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('submit', onSubmit, true)
    return () => {
      document.removeEventListener('mouseover', onOver, true)
      document.removeEventListener('mouseout', onOut, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [enabled])

  // Follow elements as the page scrolls, animates or reflows.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const nextHover = enabled ? measure(hoverId) : []
      const nextSelected = enabled ? measure(selectedId) : []
      setHoverBoxes((prev) => (same(prev, nextHover) ? prev : nextHover))
      setSelectedBoxes((prev) => (same(prev, nextSelected) ? prev : nextSelected))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled, hoverId, selectedId])

  if (!enabled) return null

  const showHover = hoverId && hoverId !== selectedId
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]">
      <style>{'[data-edit-id]{cursor:pointer}[data-edit-id]:focus-visible{outline:2px solid #6f8446;outline-offset:3px}'}</style>
      {showHover &&
        hoverBoxes.map((box, index) => (
          <Outline key={`h${index}`} box={box} tone="hover" label={index === 0 ? describe(hoverId) : null} />
        ))}
      {selectedId &&
        selectedBoxes.map((box, index) => (
          <Outline key={`s${index}`} box={box} tone="selected" label={index === 0 ? `Editing · ${describe(selectedId)}` : null} />
        ))}
    </div>
  )
}

function Outline({ box, tone, label }: { box: Box; tone: 'hover' | 'selected'; label: string | null }) {
  const pad = 4
  const above = box.top > 30
  return (
    <div
      className={
        tone === 'selected'
          ? 'absolute rounded-lg border-2 border-forest bg-forest/5 shadow-[0_0_0_4px_rgb(58_79_37/0.12)]'
          : 'absolute rounded-lg border-[1.5px] border-dashed border-olive bg-olive/5'
      }
      style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2 }}
    >
      {label && (
        <span
          className={`absolute left-0 flex max-w-[min(22rem,90vw)] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-soft ${
            tone === 'selected' ? 'bg-forest text-ivory' : 'bg-ivory text-forest ring-1 ring-olive/40'
          } ${above ? '-top-8' : '-bottom-8'}`}
        >
          <Pencil size={12} aria-hidden="true" />
          {label}
        </span>
      )}
    </div>
  )
}

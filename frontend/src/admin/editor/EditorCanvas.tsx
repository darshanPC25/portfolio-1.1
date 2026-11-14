import { useEffect, useMemo, useState } from 'react'
import { SiteStatus } from '@/components/UI/SiteStatus'
import { ContentContext } from '@/contexts/contentContextValue'
import { EditorContext, type EditorState } from '@/editor/editable'
import { useApplyAppearance } from '@/hooks/useApplyAppearance'
import { PortfolioPage } from '@/pages/PortfolioPage'
import type { PortfolioContent } from '@/types/content'
import { EditorOverlay } from './EditorOverlay'
import { type CanvasMessage, type EditorMessage, isFromParent, postToParent } from './messages'
import { describeTarget } from './targets'

/**
 * /admin/editor/canvas — loaded in the editor's frame. Renders the real
 * portfolio components (PortfolioPage) from the content the editor sends,
 * so the page here is exactly what visitors get, at any device width.
 */
export function EditorCanvas() {
  const [state, setState] = useState<{ content: PortfolioContent; mode: EditorState['mode']; selectedId: string | null } | null>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent<EditorMessage>) => {
      if (!isFromParent(event)) return
      const message = event.data
      if (message.type === 'state') {
        setState({ content: message.content, mode: message.mode, selectedId: message.selectedId })
      } else if (message.type === 'scrollTo') {
        document.querySelector(`[data-edit-id="${CSS.escape(message.id)}"]`)?.scrollIntoView({ block: 'center' })
      }
    }
    window.addEventListener('message', onMessage)
    postToParent({ type: 'ready' } satisfies CanvasMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    document.title = 'Editor canvas'
  }, [])

  useApplyAppearance(state?.content.appearance)
  const editor = useMemo<EditorState | null>(() => (state ? { mode: state.mode } : null), [state])

  if (!state || !editor) return <SiteStatus state="loading" label="Loading the editor…" />

  return (
    <ContentContext.Provider value={state.content}>
      <EditorContext.Provider value={editor}>
        <PortfolioPage />
        <EditorOverlay
          enabled={state.mode === 'edit'}
          selectedId={state.selectedId}
          describe={(id) => describeTarget(id, state.content)}
          onSelect={(id) => postToParent({ type: 'select', id })}
        />
      </EditorContext.Provider>
    </ContentContext.Provider>
  )
}

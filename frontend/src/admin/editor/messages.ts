import type { PortfolioContent } from '@/types/content'

/**
 * Messages between the editor (parent page) and its canvas frame. Both are
 * the same origin; every message is checked for origin and source.
 */

/** Editor → canvas. */
export type EditorMessage =
  | { type: 'state'; content: PortfolioContent; mode: 'edit' | 'preview'; selectedId: string | null }
  | { type: 'scrollTo'; id: string }

/** Canvas → editor. */
export type CanvasMessage = { type: 'ready' } | { type: 'select'; id: string }

export function postToParent(message: CanvasMessage) {
  if (window.parent !== window) window.parent.postMessage(message, window.location.origin)
}

export function isFromParent(event: MessageEvent): boolean {
  return event.origin === window.location.origin && event.source === window.parent && window.parent !== window
}

export function isFromFrame(event: MessageEvent, frame: HTMLIFrameElement | null): boolean {
  return event.origin === window.location.origin && frame != null && event.source === frame.contentWindow
}

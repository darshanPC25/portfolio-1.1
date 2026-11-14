import { type CSSProperties, createContext, useCallback, useContext } from 'react'
import { ContentContext } from '@/contexts/contentContextValue'
import { forDarkTheme, useTheme } from '@/hooks/useTheme'
import type { ElementStyle } from '@/types/content'

/**
 * Visual-editor support shared by the public site and the editor.
 *
 * Components tag editable elements with `{...edit('hero.greeting')}`. On the
 * public site that only applies the element's published formatting (if any).
 * Inside the editor canvas it also adds `data-edit-id` and makes the element
 * focusable, so the editor overlay can outline and select it. No wrapper
 * elements are added, so layouts are identical in both places.
 */

export interface EditorState {
  /** "edit": elements are selectable. "preview": the page behaves like the live site. */
  mode: 'edit' | 'preview'
}

/** Present only inside the editor canvas. */
export const EditorContext = createContext<EditorState | null>(null)

export interface EditableProps {
  'data-edit-id'?: string
  tabIndex?: number
  style?: CSSProperties
}

/** Element formatting → inline CSS. `zoom` scales the text and its box together. */
export function styleToCss(style: ElementStyle | undefined | null, dark = false): CSSProperties | undefined {
  if (!style) return undefined
  const css: CSSProperties = {}
  // Colours are picked on the light theme; keep their hue but make them readable on dark.
  if (style.color) css.color = dark ? forDarkTheme(style.color) : style.color
  if (style.fontWeight) css.fontWeight = style.fontWeight
  if (style.textAlign) css.textAlign = style.textAlign
  if (style.fontFamily) css.fontFamily = style.fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)'
  if (style.fontScale && style.fontScale !== 1) css.zoom = style.fontScale
  return Object.keys(css).length ? css : undefined
}

/** Returns `edit(id)`, which gives the props to spread on an editable element. */
export function useEditables(): (id: string) => EditableProps {
  const editor = useContext(EditorContext)
  const content = useContext(ContentContext)
  const styles = content?.styles
  const editing = editor?.mode === 'edit'
  const dark = useTheme().theme === 'dark'

  return useCallback(
    (id: string) => {
      const props: EditableProps = {}
      const css = styleToCss(styles?.[id], dark)
      if (css) props.style = css
      if (editing) {
        props['data-edit-id'] = id
        props.tabIndex = 0
      }
      return props
    },
    [styles, editing, dark],
  )
}

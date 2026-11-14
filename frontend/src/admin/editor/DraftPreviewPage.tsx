import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SiteStatus } from '@/components/UI/SiteStatus'
import { ContentContext } from '@/contexts/contentContextValue'
import { useApplyAppearance } from '@/hooks/useApplyAppearance'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { adminApi } from '../api/adminApi'
import { EditorOverlay } from './EditorOverlay'
import { PREVIEW_KEY } from './Inspector'

/** /admin/preview — the full draft site, exactly as it would look if published now. */
export function DraftPreviewPage() {
  const draft = useQuery({ queryKey: PREVIEW_KEY, queryFn: adminApi.preview })
  useApplyAppearance(draft.data?.appearance)

  useEffect(() => {
    document.title = 'Draft preview — Portfolio Studio'
  }, [])

  if (draft.isPending) return <SiteStatus state="loading" label="Loading the draft…" />
  if (draft.isError) return <SiteStatus state="error" onRetry={() => draft.refetch()} retrying={draft.isRefetching} />

  return (
    <ContentContext.Provider value={draft.data}>
      <PortfolioPage />
      {/* Guards only: keeps links on the page and stops the contact form from sending. */}
      <EditorOverlay enabled={false} selectedId={null} describe={(id) => id} onSelect={() => undefined} />
      <div
        role="status"
        className="fixed bottom-4 left-4 z-[200] flex items-center gap-3 rounded-full bg-pine/95 py-2 pr-2 pl-4 text-sm text-ivory shadow-lift"
      >
        <Eye size={16} aria-hidden="true" />
        Draft preview · not published
        <Link to="/admin/editor" className="rounded-full bg-ivory px-3 py-1 text-forest">
          Back to editor
        </Link>
      </div>
    </ContentContext.Provider>
  )
}

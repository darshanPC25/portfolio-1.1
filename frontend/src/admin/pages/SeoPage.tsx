import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { resolveMediaUrl } from '@/services/apiClient'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import { FileUpload, IMAGE_HINT, IMAGE_MAX, IMAGE_TYPES } from '../components/FileUpload'
import type { FieldDef } from '../components/form/fieldTypes'
import { SingletonForm } from '../components/SingletonForm'
import { useToast } from '../components/Toast'
import { LoadState, PageHeader, Panel, StudioButton } from '../components/ui'

const KEY = adminKeys.resource('seo')

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Page title', type: 'text', required: true, max: 120, wide: true, hint: 'Shown in browser tabs and search results.' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    max: 300,
    rows: 3,
    hint: 'One or two sentences for search results and link previews.',
  },
  { name: 'canonicalUrl', label: 'Canonical URL', type: 'url', max: 500, wide: true, hint: "The site's public address, once it has one." },
  { name: 'allowIndexing', label: 'Allow search engines to index the site', type: 'toggle', wide: true },
]

function SharingImage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: KEY, queryFn: adminApi.seo })
  // Merge only the image so unsaved edits in the form are kept.
  const merge = (saved: { ogImage: unknown }) =>
    queryClient.setQueryData(KEY, (old: object | undefined) => (old ? { ...old, ogImage: saved.ogImage } : saved))
  const upload = useStudioMutation(adminApi.uploadOgImage, { success: 'Sharing image saved to the draft.', onSuccess: merge })
  const remove = useStudioMutation(adminApi.removeOgImage, { success: 'Sharing image removed.', onSuccess: merge })
  const src = resolveMediaUrl(query.data?.ogImage?.url ?? null)

  return (
    <Panel title="Sharing image" description="Shown when the site is shared on social media. 1200×630 works best.">
      {query.isPending ? (
        <LoadState />
      ) : query.isError ? (
        <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="aspect-[1200/630] w-60 shrink-0 overflow-hidden rounded-xl border border-sand bg-cream">
            {src ? (
              <img src={src} alt="Current sharing image" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-sm text-muted">No image</span>
            )}
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <FileUpload
              label={src ? 'Replace image' : 'Upload image'}
              accept={IMAGE_TYPES}
              hint={IMAGE_HINT}
              maxBytes={IMAGE_MAX}
              busy={upload.isPending}
              onFile={(file) => upload.mutate(file)}
              onInvalid={(message) => toast.show(message, 'error')}
            />
            {src && (
              <StudioButton
                size="sm"
                variant="danger"
                icon={<Trash2 size={16} aria-hidden="true" />}
                loading={remove.isPending}
                onClick={() => remove.mutate(undefined)}
              >
                Remove
              </StudioButton>
            )}
          </div>
        </div>
      )}
    </Panel>
  )
}

export function SeoPage() {
  return (
    <>
      <PageHeader title="SEO" description="How the site appears in search results and link previews." />
      <div className="flex flex-col gap-6">
        <SingletonForm resource="seo" title="Search and sharing" fields={FIELDS} load={adminApi.seo} save={adminApi.updateSeo} />
        <SharingImage />
      </div>
    </>
  )
}

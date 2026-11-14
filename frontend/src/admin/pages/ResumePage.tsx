import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, ExternalLink, FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { resolveMediaUrl } from '@/services/apiClient'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import { ConfirmDialog } from '../components/Dialog'
import { FileUpload } from '../components/FileUpload'
import { useToast } from '../components/Toast'
import { EmptyState, formatBytes, formatDateTime, LoadState, PageHeader, Panel, StudioButton } from '../components/ui'

const KEY = adminKeys.resource('resume')

export function ResumePage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: KEY, queryFn: adminApi.resume })
  const [confirmRemove, setConfirmRemove] = useState(false)

  const upload = useStudioMutation(adminApi.uploadResume, {
    success: 'Resume uploaded to the draft. Publish to offer it for download.',
    onSuccess: (resume) => {
      queryClient.setQueryData(KEY, { resume })
      queryClient.invalidateQueries({ queryKey: adminKeys.resource('profile') })
    },
  })
  const remove = useStudioMutation(adminApi.removeResume, {
    success: 'Resume removed from the draft.',
    onSuccess: () => {
      queryClient.setQueryData(KEY, { resume: null })
      setConfirmRemove(false)
    },
  })

  const resume = query.data?.resume
  const url = resolveMediaUrl(resume?.url ?? null)

  return (
    <>
      <PageHeader
        title="Resume"
        description="Upload a PDF. Visitors can download it from the hero once you publish."
      />
      <Panel
        title="Resume PDF"
        actions={
          <FileUpload
            label={resume ? 'Replace PDF' : 'Upload PDF'}
            accept="application/pdf"
            hint="PDF, up to 10 MB"
            maxBytes={10 * 1024 * 1024}
            busy={upload.isPending}
            onFile={(file) => upload.mutate(file)}
            onInvalid={(message) => toast.show(message, 'error')}
          />
        }
      >
        {query.isPending ? (
          <LoadState />
        ) : query.isError ? (
          <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
        ) : !resume || !url ? (
          <EmptyState>No resume uploaded yet. The download link stays hidden on the site until there is one.</EmptyState>
        ) : (
          <>
            <div className="flex flex-col gap-4 rounded-2xl border border-sand/80 bg-cream/40 p-4 sm:flex-row sm:items-center">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mist text-forest">
                <FileText size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium break-words text-ink">{resume.filename}</p>
                <p className="text-sm text-muted">
                  {formatBytes(resume.sizeBytes)} · uploaded {formatDateTime(resume.uploadedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-sand bg-ivory px-3.5 text-sm text-forest hover:bg-mist/60"
                >
                  <ExternalLink size={16} aria-hidden="true" /> Open
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <a
                  href={`${url}?download=true`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-sand bg-ivory px-3.5 text-sm text-forest hover:bg-mist/60"
                >
                  <Download size={16} aria-hidden="true" /> Download
                </a>
                <StudioButton
                  size="sm"
                  variant="danger"
                  icon={<Trash2 size={16} aria-hidden="true" />}
                  onClick={() => setConfirmRemove(true)}
                >
                  Remove
                </StudioButton>
              </div>
            </div>
            <iframe
              title={`Preview of ${resume.filename}`}
              src={url}
              className="mt-5 h-[70svh] w-full rounded-2xl border border-sand bg-cream"
            />
          </>
        )}
      </Panel>

      <ConfirmDialog
        open={confirmRemove}
        title="Remove the resume?"
        message="The download link disappears from the site after you publish."
        confirmLabel="Remove"
        busy={remove.isPending}
        onConfirm={() => remove.mutate(undefined)}
        onClose={() => setConfirmRemove(false)}
      />
    </>
  )
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Rocket } from 'lucide-react'
import { useId, useState } from 'react'
import { PORTFOLIO_CONTENT_QUERY_KEY } from '@/contexts/ContentContext'
import { adminApi } from '../api/adminApi'
import { adminKeys, useStudioMutation } from '../api/queries'
import { ConfirmDialog } from './Dialog'
import { inputClass } from './form/Fields'
import { StudioButton } from './ui'

/** "Unpublished changes" indicator and the Publish action (with confirmation). */
export function PublishControl() {
  const queryClient = useQueryClient()
  const overview = useQuery({ queryKey: adminKeys.overview, queryFn: adminApi.overview })
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const noteId = useId()

  const publish = useStudioMutation(() => adminApi.publish(note.trim() || null), {
    invalidate: [adminKeys.publications],
    success: (p) => `Published version ${p.version}. The live site now shows your changes.`,
    onSuccess: () => {
      setOpen(false)
      setNote('')
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_CONTENT_QUERY_KEY })
    },
  })

  const pending = overview.data?.hasUnpublishedChanges

  return (
    <div className="flex items-center gap-3">
      <p className="hidden text-sm sm:block" aria-live="polite">
        {overview.data == null ? null : pending ? (
          <span className="inline-flex items-center gap-2 text-[#7a5a14]">
            <span className="size-2 rounded-full bg-[#c99a2e]" aria-hidden="true" />
            Unpublished changes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-moss">
            <CheckCircle2 size={15} aria-hidden="true" />
            Live site is up to date
          </span>
        )}
      </p>
      <StudioButton
        variant={pending ? 'primary' : 'secondary'}
        size="sm"
        icon={<Rocket size={16} aria-hidden="true" />}
        onClick={() => setOpen(true)}
      >
        Publish
      </StudioButton>

      <ConfirmDialog
        open={open}
        title="Publish changes?"
        tone="primary"
        confirmLabel="Publish now"
        busy={publish.isPending}
        message={
          pending
            ? 'Everything currently in the draft becomes the live portfolio for all visitors.'
            : 'There are no unpublished changes, but you can publish again to create a new version.'
        }
        onConfirm={() => publish.mutate(undefined)}
        onClose={() => setOpen(false)}
      >
        <label htmlFor={noteId} className="mt-5 mb-1.5 block text-sm font-medium text-forest">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={noteId}
          className={inputClass}
          maxLength={200}
          placeholder="e.g. Added the transport project"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </ConfirmDialog>
    </div>
  )
}

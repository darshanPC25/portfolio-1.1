import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Archive, Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import type { Message, MessageStatus } from '../api/types'
import { ConfirmDialog, Dialog } from '../components/Dialog'
import { SectionCard } from '../components/SectionCard'
import { EmptyState, formatDateTime, LoadState, PageHeader, Panel, StatusPill, StudioButton } from '../components/ui'

const FILTERS: { value: MessageStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'NEW', label: 'Unread' },
  { value: 'READ', label: 'Read' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const STATUS_PILL: Record<MessageStatus, { tone: 'amber' | 'muted' | 'green'; label: string }> = {
  NEW: { tone: 'amber', label: 'Unread' },
  READ: { tone: 'green', label: 'Read' },
  ARCHIVED: { tone: 'muted', label: 'Archived' },
}

export function MessagesPage() {
  const [filter, setFilter] = useState<MessageStatus | null>(null)
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState<Message | null>(null)
  const key = [...adminKeys.resource('messages'), filter ?? 'ALL', page] as const
  const query = useQuery({
    queryKey: key,
    queryFn: () => adminApi.messages(filter, page),
    placeholderData: keepPreviousData,
  })

  const invalidate = [adminKeys.resource('messages')] as const
  const setStatus = useStudioMutation(
    ({ id, status }: { id: string; status: MessageStatus }) => adminApi.setMessageStatus(id, status),
    { invalidate, onSuccess: (message) => setOpen((current) => (current?.id === message.id ? message : current)) },
  )
  const remove = useStudioMutation((id: string) => adminApi.deleteMessage(id), {
    invalidate,
    success: 'Message deleted.',
    onSuccess: () => {
      setDeleting(null)
      setOpen(null)
    },
  })

  const openMessage = (message: Message) => {
    setOpen(message)
    if (message.status === 'NEW') setStatus.mutate({ id: message.id, status: 'READ' })
  }

  const data = query.data
  const pages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1

  return (
    <>
      <PageHeader title="Messages" description="Sent through the contact form on the site. Opening a message marks it as read." />
      <div className="flex flex-col gap-6">
        <Panel>
          <div role="tablist" aria-label="Filter messages" className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => {
                  setFilter(f.value)
                  setPage(0)
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm transition-colors',
                  filter === f.value ? 'bg-forest text-ivory' : 'border border-sand text-forest hover:bg-mist/60',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {query.isPending ? (
            <LoadState />
          ) : query.isError ? (
            <LoadState error={errorMessage(query.error)} onRetry={() => query.refetch()} />
          ) : data!.items.length === 0 ? (
            <EmptyState>
              <Inbox className="mx-auto mb-2" aria-hidden="true" />
              No messages here.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-sand/70 rounded-2xl border border-sand/80">
              {data!.items.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => openMessage(message)}
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-mist/40 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="flex items-center gap-2 sm:w-48 sm:shrink-0">
                      {message.status === 'NEW' ? (
                        <Mail size={16} className="text-[#c99a2e]" aria-hidden="true" />
                      ) : (
                        <MailOpen size={16} className="text-muted" aria-hidden="true" />
                      )}
                      <span className={cn('truncate', message.status === 'NEW' ? 'font-semibold text-ink' : 'text-forest')}>
                        {message.name}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <span className={cn(message.status === 'NEW' && 'font-semibold text-ink')}>{message.subject}</span>
                      <span className="text-muted"> — {message.message}</span>
                    </span>
                    <span className="text-xs text-muted sm:shrink-0">{formatDateTime(message.receivedAt)}</span>
                    <span className="sr-only">{STATUS_PILL[message.status].label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {data && data.total > data.size && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>
                Page {page + 1} of {pages} · {data.total} messages
              </span>
              <div className="flex gap-2">
                <StudioButton size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </StudioButton>
                <StudioButton size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </StudioButton>
              </div>
            </div>
          )}
        </Panel>

        <SectionCard sectionKey="CONTACT" title="Contact section" />
      </div>

      <Dialog open={open !== null} onClose={() => setOpen(null)} title={open?.subject ?? ''} size="lg">
        {open && (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="font-medium text-ink">{open.name}</span>
              <a href={`mailto:${open.email}`} className="text-forest underline underline-offset-4">
                {open.email}
              </a>
              <span>{formatDateTime(open.receivedAt)}</span>
              <StatusPill tone={STATUS_PILL[open.status].tone}>{STATUS_PILL[open.status].label}</StatusPill>
            </div>
            <p className="mt-5 rounded-2xl bg-cream/60 p-5 whitespace-pre-wrap text-ink">{open.message}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-b from-moss to-forest px-5 text-ivory shadow-button"
              >
                <Reply size={16} aria-hidden="true" /> Reply by email
              </a>
              {open.status !== 'NEW' && (
                <StudioButton
                  icon={<Mail size={16} aria-hidden="true" />}
                  onClick={() => setStatus.mutate({ id: open.id, status: 'NEW' })}
                >
                  Mark unread
                </StudioButton>
              )}
              {open.status !== 'ARCHIVED' && (
                <StudioButton
                  icon={<Archive size={16} aria-hidden="true" />}
                  onClick={() => setStatus.mutate({ id: open.id, status: 'ARCHIVED' })}
                >
                  Archive
                </StudioButton>
              )}
              <StudioButton variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => setDeleting(open)}>
                Delete
              </StudioButton>
            </div>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this message?"
        message="It will be permanently removed. This cannot be undone. Archive it instead if you might need it later."
        confirmLabel="Delete permanently"
        busy={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}

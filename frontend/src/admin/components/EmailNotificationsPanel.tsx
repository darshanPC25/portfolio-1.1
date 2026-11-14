import { useQuery } from '@tanstack/react-query'
import { CircleAlert, CircleCheck, Send } from 'lucide-react'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import type { NotificationSettings } from '../api/types'
import type { FieldDef, FormValues } from './form/fieldTypes'
import { SingletonForm } from './SingletonForm'
import { LoadState, Panel, StudioButton } from './ui'

const FIELDS: FieldDef[] = [
  {
    name: 'emailEnabled',
    label: 'Email me new messages',
    type: 'toggle',
    hint: 'Every message sent through the contact form is also emailed to you. It is always kept here too.',
  },
  {
    name: 'recipientEmail',
    label: 'Send notifications to',
    type: 'email',
    max: 254,
    hint: 'Leave empty to use the mailbox the site sends from.',
  },
]

/**
 * Email notifications for contact messages. The mail account (and its password)
 * is configured only on the server; this panel shows its status, turns
 * notifications on or off, picks the recipient and sends a test email.
 */
export function EmailNotificationsPanel() {
  const status = useQuery({ queryKey: adminKeys.resource('notifications'), queryFn: adminApi.notifications })
  const test = useStudioMutation(() => adminApi.sendTestEmail(), {
    success: (result) => `Test email sent to ${result.sentTo}. Check your inbox (and spam folder).`,
  })

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Email delivery"
        description="Messages are sent from your own mailbox, so replies go straight from your email app to the visitor."
      >
        {status.isPending ? (
          <LoadState />
        ) : status.isError ? (
          <LoadState error={errorMessage(status.error)} onRetry={() => status.refetch()} />
        ) : status.data.smtpConfigured ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-ink">
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-olive" aria-hidden="true" />
              <span>
                Ready. Sending from <strong className="font-medium">{status.data.fromAddress}</strong> via{' '}
                {status.data.smtpHost}
                {status.data.emailEnabled ? (
                  <>
                    {' '}
                    to <strong className="font-medium">{status.data.effectiveRecipient}</strong>.
                  </>
                ) : (
                  <>. Notifications are currently off.</>
                )}
              </span>
            </p>
            <StudioButton
              size="sm"
              icon={<Send size={15} aria-hidden="true" />}
              loading={test.isPending}
              onClick={() => test.mutate(undefined)}
            >
              Send test email
            </StudioButton>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-sm text-ink">
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <p>Email sending is not set up on the server yet. Messages are still saved here.</p>
              <p className="mt-2 text-muted">
                Add <code>MAIL_HOST</code>, <code>MAIL_USERNAME</code> and <code>MAIL_PASSWORD</code> to{' '}
                <code>backend/.env</code> and restart the backend. For Gmail use <code>smtp.gmail.com</code> and an app
                password (Google Account → Security → App passwords), never your normal password.
              </p>
            </div>
          </div>
        )}
      </Panel>

      <SingletonForm<NotificationSettings>
        resource="notifications"
        title="Notifications"
        fields={FIELDS}
        load={adminApi.notifications}
        save={(values: FormValues) => adminApi.updateNotifications(values)}
      />
    </div>
  )
}

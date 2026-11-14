import { Link } from 'react-router-dom'
import { adminApi } from '../api/adminApi'
import type { SocialLink } from '../api/types'
import { CollectionManager } from '../components/CollectionManager'
import type { FieldDef } from '../components/form/fieldTypes'
import { SectionCard } from '../components/SectionCard'
import { PageHeader, StatusPill } from '../components/ui'

export const PLATFORMS = [
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'WEBSITE', label: 'Website' },
]

export const SOCIAL_FIELDS: FieldDef[] = [
  { name: 'platform', label: 'Platform', type: 'select', required: true, options: PLATFORMS },
  { name: 'label', label: 'Label', type: 'text', required: true, max: 60, hint: 'Read by screen readers.' },
  {
    name: 'url',
    label: 'Link',
    type: 'text',
    max: 500,
    wide: true,
    hint: 'A full web address (https://…), or an email address for Email. Links without an address are not shown.',
  },
  { name: 'visible', label: 'Shown on the site', type: 'toggle' },
]

const BLANK = { platform: 'GITHUB', label: '', url: '', visible: true }

export function SocialLinksPage() {
  return (
    <>
      <PageHeader title="Social links" description="Icons in the contact section and footer." />
      <div className="flex flex-col gap-6">
        <CollectionManager<SocialLink>
          resource="social-links"
          noun="link"
          title="Links"
          fields={SOCIAL_FIELDS}
          blank={BLANK}
          list={adminApi.socialLinks}
          create={adminApi.createSocialLink}
          update={adminApi.updateSocialLink}
          remove={adminApi.deleteSocialLink}
          reorder={adminApi.reorderSocialLinks}
          toForm={(link) => ({ ...link, url: link.url?.replace(/^mailto:/i, '') ?? '' })}
          summary={(link) => ({
            title: link.label,
            subtitle: link.url ?? undefined,
            meta: (
              <>
                <StatusPill tone="muted">{PLATFORMS.find((p) => p.value === link.platform)?.label}</StatusPill>
                {!link.url && <StatusPill tone="amber">No address yet</StatusPill>}
              </>
            ),
          })}
          emptyText="No links yet."
        />
        <SectionCard sectionKey="GITHUB" title="GitHub section" />
        <p className="text-sm text-muted">
          The GitHub username that fills the GitHub section is set on the{' '}
          <Link to="/admin/profile" className="text-forest underline underline-offset-4">
            Profile
          </Link>{' '}
          page.
        </p>
      </div>
    </>
  )
}

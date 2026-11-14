import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { resolveMediaUrl } from '@/services/apiClient'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import { FileUpload, IMAGE_HINT, IMAGE_MAX, IMAGE_TYPES } from '../components/FileUpload'
import type { FieldDef } from '../components/form/fieldTypes'
import { SingletonForm } from '../components/SingletonForm'
import { useToast } from '../components/Toast'
import { formatBytes, LoadState, PageHeader, Panel } from '../components/ui'

const FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', type: 'text', required: true, max: 120 },
  { name: 'preferredName', label: 'Preferred name', type: 'text', required: true, max: 60, hint: 'Used in the menu and footer.' },
  { name: 'title', label: 'Professional title', type: 'text', required: true, max: 160 },
  { name: 'location', label: 'Location', type: 'text', required: true, max: 120 },
  { name: 'publicEmail', label: 'Public email', type: 'email', max: 254, hint: 'Leave empty to keep your email private.' },
  {
    name: 'githubUsername',
    label: 'GitHub username',
    type: 'text',
    max: 39,
    hint: 'Shows your public repositories in the GitHub section.',
  },
  { name: 'availabilityLabel', label: 'Availability text', type: 'text', required: true, max: 120 },
  { name: 'available', label: 'Available for opportunities', type: 'toggle', hint: 'Shows a pulsing green dot.' },
  { name: 'photoAlt', label: 'Photo description', type: 'text', required: true, max: 200, wide: true, hint: 'Read aloud by screen readers.' },
  { name: 'copyrightText', label: 'Copyright line', type: 'text', required: true, max: 200 },
  { name: 'footerNote', label: 'Footer note', type: 'text', required: true, max: 200 },
]

function PhotoPanel() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: adminKeys.resource('profile'), queryFn: adminApi.profile })
  const upload = useStudioMutation(adminApi.uploadPhoto, {
    success: 'Photo replaced in the draft. Publish to show it on the site.',
    // Merge only the photo, so unsaved edits in the details form are kept.
    onSuccess: (saved) =>
      queryClient.setQueryData(adminKeys.resource('profile'), (old: typeof saved | undefined) =>
        old ? { ...old, photo: saved.photo } : saved,
      ),
  })

  const photo = profile.data?.photo
  const src = resolveMediaUrl(photo?.url ?? null)

  return (
    <Panel title="Profile photo" description="Shown in the hero. A portrait (4:5) works best.">
      {profile.isPending ? (
        <LoadState />
      ) : profile.isError ? (
        <LoadState error={errorMessage(profile.error)} onRetry={() => profile.refetch()} />
      ) : (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="aspect-[4/5] w-36 shrink-0 overflow-hidden rounded-t-full rounded-b-3xl border border-white bg-linear-to-b from-mist to-sage shadow-soft">
            {src ? (
              <img src={src} alt={profile.data.photoAlt} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-moss">
                <ImageOff aria-hidden="true" />
              </span>
            )}
          </div>
          <div>
            {photo && (
              <p className="mb-3 text-sm text-muted">
                {photo.filename}
                {photo.width && photo.height ? ` · ${photo.width}×${photo.height}` : ''}
                {photo.sizeBytes ? ` · ${formatBytes(photo.sizeBytes)}` : ''}
              </p>
            )}
            <FileUpload
              label="Replace photo"
              accept={IMAGE_TYPES}
              hint={IMAGE_HINT}
              maxBytes={IMAGE_MAX}
              busy={upload.isPending}
              onFile={(file) => upload.mutate(file)}
              onInvalid={(message) => toast.show(message, 'error')}
            />
          </div>
        </div>
      )}
    </Panel>
  )
}

export function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Who you are, as shown across the site." />
      <div className="flex flex-col gap-6">
        <PhotoPanel />
        <SingletonForm
          resource="profile"
          title="Personal information"
          fields={FIELDS}
          load={adminApi.profile}
          save={adminApi.updateProfile}
        />
      </div>
    </>
  )
}

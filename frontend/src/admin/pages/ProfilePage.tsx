import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { resolveMediaUrl } from '@/services/apiClient'
import { adminApi } from '../api/adminApi'
import { adminKeys, errorMessage, useStudioMutation } from '../api/queries'
import { FileUpload, IMAGE_HINT, IMAGE_MAX, IMAGE_TYPES } from '../components/FileUpload'
import type { FieldDef } from '../components/form/fieldTypes'
import { SingletonForm } from '../components/SingletonForm'
import { useToast } from '../components/Toast'
import { formatBytes, LoadState, PageHeader, Panel, StudioButton } from '../components/ui'
import type { Profile } from '../api/types'
import { cn } from '@/utils/cn'

const FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', type: 'text', required: true, max: 120 },
  {
    name: 'preferredName',
    label: 'Preferred name',
    type: 'text',
    required: true,
    max: 60,
    hint: 'Used in the menu and footer.',
  },
  { name: 'title', label: 'Professional title', type: 'text', required: true, max: 160 },
  { name: 'location', label: 'Location', type: 'text', required: true, max: 120 },
  {
    name: 'publicEmail',
    label: 'Public email',
    type: 'email',
    max: 254,
    hint: 'Leave empty to keep your email private.',
  },
  {
    name: 'githubUsername',
    label: 'GitHub username',
    type: 'text',
    max: 39,
    hint: 'Fills the GitHub section. Leave empty to use the username in your GitHub social link.',
  },
  { name: 'availabilityLabel', label: 'Availability text', type: 'text', required: true, max: 120 },
  { name: 'available', label: 'Available for opportunities', type: 'toggle', hint: 'Shows a pulsing green dot.' },
  {
    name: 'photoAlt',
    label: 'Photo description',
    type: 'text',
    required: true,
    max: 200,
    wide: true,
    hint: 'Read aloud by screen readers.',
  },
  { name: 'copyrightText', label: 'Copyright line', type: 'text', required: true, max: 200 },
  { name: 'footerNote', label: 'Footer note', type: 'text', required: true, max: 200 },
]

/** Upload panel for the regular photo or the optional dark-theme photo. */
function PhotoPanel({ variant }: { variant: 'light' | 'dark' }) {
  const dark = variant === 'dark'
  const toast = useToast()
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: adminKeys.resource('profile'), queryFn: adminApi.profile })
  // Merge only the photo fields, so unsaved edits in the details form are kept.
  const mergePhotos = (saved: Profile) =>
    queryClient.setQueryData(adminKeys.resource('profile'), (old: Profile | undefined) =>
      old ? { ...old, photo: saved.photo, photoDark: saved.photoDark } : saved,
    )
  const upload = useStudioMutation(dark ? adminApi.uploadDarkPhoto : adminApi.uploadPhoto, {
    success: 'Photo replaced in the draft. Publish to show it on the site.',
    onSuccess: mergePhotos,
  })
  const remove = useStudioMutation(adminApi.removeDarkPhoto, {
    success: 'Dark mode photo removed from the draft. The regular photo is used in both themes.',
    onSuccess: mergePhotos,
  })

  const photo = dark ? profile.data?.photoDark : profile.data?.photo
  const src = resolveMediaUrl(photo?.url ?? null)

  return (
    <Panel
      title={dark ? 'Dark mode photo' : 'Profile photo'}
      description={
        dark
          ? 'Optional. Shown in the hero when a visitor uses the dark theme; without it the profile photo is used.'
          : 'Shown in the hero. A portrait (4:5) works best.'
      }
    >
      {profile.isPending ? (
        <LoadState />
      ) : profile.isError ? (
        <LoadState error={errorMessage(profile.error)} onRetry={() => profile.refetch()} />
      ) : (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            className={cn(
              'aspect-[4/5] w-36 shrink-0 overflow-hidden rounded-t-full rounded-b-3xl border border-white shadow-soft',
              dark ? 'theme-fixed bg-linear-to-b from-forest to-pine' : 'bg-linear-to-b from-mist to-sage',
            )}
          >
            {src ? (
              <img src={src} alt={profile.data.photoAlt} className="size-full object-cover" />
            ) : (
              <span className={cn('flex size-full items-center justify-center', dark ? 'text-sage' : 'text-moss')}>
                <ImageOff aria-hidden="true" />
                <span className="sr-only">No photo</span>
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
              label={dark ? (photo ? 'Replace dark mode photo' : 'Upload dark mode photo') : 'Replace photo'}
              accept={IMAGE_TYPES}
              hint={IMAGE_HINT}
              maxBytes={IMAGE_MAX}
              busy={upload.isPending}
              onFile={(file) => upload.mutate(file)}
              onInvalid={(message) => toast.show(message, 'error')}
            />
            {dark && photo && (
              <StudioButton
                size="sm"
                variant="ghost"
                className="mt-3 -ml-2"
                loading={remove.isPending}
                onClick={() => remove.mutate(undefined)}
              >
                Remove dark mode photo
              </StudioButton>
            )}
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
        <div className="grid gap-6 xl:grid-cols-2">
          <PhotoPanel variant="light" />
          <PhotoPanel variant="dark" />
        </div>
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

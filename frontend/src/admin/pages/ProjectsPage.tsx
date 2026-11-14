import { useQueryClient } from '@tanstack/react-query'
import { ImageOff, Star } from 'lucide-react'
import { resolveMediaUrl } from '@/services/apiClient'
import { adminApi } from '../api/adminApi'
import { adminKeys, useStudioMutation } from '../api/queries'
import type { Project } from '../api/types'
import { CollectionManager } from '../components/CollectionManager'
import { FileUpload, IMAGE_HINT, IMAGE_MAX, IMAGE_TYPES } from '../components/FileUpload'
import type { FieldDef } from '../components/form/fieldTypes'
import { SectionCard } from '../components/SectionCard'
import { useToast } from '../components/Toast'
import { PageHeader, StatusPill } from '../components/ui'

export const PROJECT_STATUS_OPTIONS = [
  { value: 'IN_DEVELOPMENT', label: 'In development' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PLANNED', label: 'Planned' },
]

export const PROJECT_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Project name', type: 'text', required: true, max: 160, wide: true },
  {
    name: 'slug',
    label: 'Web address name (slug)',
    type: 'slug',
    max: 120,
    hint: 'Leave empty to generate it from the name.',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: PROJECT_STATUS_OPTIONS,
    hint: 'Only mark a project completed when it is.',
  },
  { name: 'summary', label: 'Short summary', type: 'textarea', required: true, max: 300, rows: 2 },
  { name: 'description', label: 'Description', type: 'textarea', required: true, max: 5000, rows: 5 },
  { name: 'highlights', label: 'Highlights', type: 'list', itemLabel: 'Highlight', max: 300, maxItems: 10 },
  { name: 'tags', label: 'Technology tags', type: 'list', itemLabel: 'Tag', max: 60, maxItems: 10 },
  { name: 'repoUrl', label: 'Source code URL', type: 'url', max: 500, hint: 'Leave empty until the repository is public.' },
  { name: 'demoUrl', label: 'Live demo URL', type: 'url', max: 500 },
  { name: 'imageAlt', label: 'Image description', type: 'text', required: true, max: 200, wide: true },
  { name: 'featured', label: 'Featured project', type: 'toggle', hint: 'Shown large at the top of the section.' },
  { name: 'visible', label: 'Published (shown on the site)', type: 'toggle' },
]

const BLANK = {
  name: '',
  slug: '',
  status: 'IN_DEVELOPMENT',
  summary: '',
  description: '',
  highlights: [],
  tags: [],
  repoUrl: '',
  demoUrl: '',
  imageAlt: '',
  featured: false,
  visible: false,
}

function ImageEditor({ project }: { project: Project }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const upload = useStudioMutation((file: File) => adminApi.uploadProjectImage(project.id, file), {
    success: 'Image replaced in the draft.',
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.resource('projects') }),
  })
  const src = resolveMediaUrl(project.image?.url ?? null)

  return (
    <div className="mt-6 rounded-2xl border border-sand/80 bg-cream/40 p-4">
      <p className="mb-3 text-sm font-medium text-forest">Project image</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="aspect-[16/10] w-48 shrink-0 overflow-hidden rounded-xl bg-sand/60">
          {src ? (
            <img src={src} alt={project.imageAlt} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-moss">
              <ImageOff aria-hidden="true" />
            </span>
          )}
        </div>
        <FileUpload
          label="Replace image"
          accept={IMAGE_TYPES}
          hint={`${IMAGE_HINT}. A 16:10 screenshot works best`}
          maxBytes={IMAGE_MAX}
          busy={upload.isPending}
          onFile={(file) => upload.mutate(file)}
          onInvalid={(message) => toast.show(message, 'error')}
        />
      </div>
    </div>
  )
}

export function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Add, edit, order and publish your projects." />
      <div className="flex flex-col gap-6">
        <CollectionManager<Project>
          resource="projects"
          noun="project"
          title="Projects"
          description="Hidden projects stay in the draft but are not shown on the site. Use the arrows to change the order."
          fields={PROJECT_FIELDS}
          blank={BLANK}
          list={adminApi.projects}
          create={adminApi.createProject}
          update={adminApi.updateProject}
          remove={adminApi.deleteProject}
          reorder={adminApi.reorderProjects}
          setVisible={adminApi.setProjectVisible}
          toForm={(project) => ({ ...project })}
          summary={(project) => ({
            title: project.name,
            subtitle: project.summary,
            meta: (
              <>
                <StatusPill tone="muted">{PROJECT_STATUS_OPTIONS.find((o) => o.value === project.status)?.label}</StatusPill>
                {project.featured && (
                  <StatusPill tone="amber">
                    <Star size={12} aria-hidden="true" /> Featured
                  </StatusPill>
                )}
              </>
            ),
            thumbnail: project.image ? (
              <img
                src={resolveMediaUrl(project.image.url) ?? undefined}
                alt=""
                className="aspect-[16/10] w-24 shrink-0 rounded-lg object-cover"
              />
            ) : undefined,
          })}
          editExtra={(project) => <ImageEditor project={project} />}
          emptyText="No projects yet. Add your first one."
        />
        <SectionCard sectionKey="PROJECTS" title="Section heading" />
      </div>
    </>
  )
}

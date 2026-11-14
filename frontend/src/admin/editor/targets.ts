import type { ElementStyle, PortfolioContent, ProjectStatus as PublicStatus, SectionId } from '@/types/content'
import { adminApi } from '../api/adminApi'
import type { Project, SectionKey } from '../api/types'
import type { FieldDef, FormValues } from '../components/form/fieldTypes'
import { EDUCATION_FIELDS } from '../pages/EducationPage'
import { EXPERIENCE_FIELDS } from '../pages/ExperiencePage'
import { PROJECT_FIELDS } from '../pages/ProjectsPage'
import { ICONS } from '../pages/SkillsPage'
import { SOCIAL_FIELDS } from '../pages/SocialLinksPage'

/**
 * Everything the visual editor can edit, keyed by the editor ids that the
 * public components put on their elements (see `src/editor/editable.ts`).
 *
 * Every save is read-modify-write: the current draft record is fetched
 * fresh, only the edited fields change, and the full record goes back
 * through the same validated API the studio pages use. Nothing else in the
 * record can be lost.
 */

export type ExtraAction =
  | { kind: 'image'; label: string; upload: (file: File) => Promise<unknown> }
  | { kind: 'order'; label: string; ids: () => Promise<string[]>; reorder: (ids: string[]) => Promise<unknown>; selfId: string }
  | { kind: 'manage'; label: string; page: ManagePage }
  | { kind: 'addSkill'; categoryId: string }
  | { kind: 'link'; label: string; to: string }

export type ManagePage = 'projects' | 'experience' | 'education' | 'social-links' | 'skills' | 'about' | 'hero'

export interface EditTarget {
  id: string
  /** Where on the page, e.g. "Hero". */
  group: string
  /** What, e.g. "Greeting". */
  label: string
  hint?: string
  fields: FieldDef[]
  load: () => Promise<FormValues>
  save: (values: FormValues) => Promise<unknown>
  /** Applies unsaved values to a copy of the content for live preview. */
  preview?: (content: PortfolioContent, values: FormValues) => void
  /** Text element: offer formatting controls. */
  styleable?: boolean
  extras?: ExtraAction[]
}

const SECTION_IDS: SectionId[] = ['about', 'skills', 'projects', 'journey', 'education', 'github', 'contact']
const SECTION_NAMES: Record<string, string> = {
  about: 'About',
  skills: 'Skills',
  projects: 'Projects',
  journey: 'Journey',
  education: 'Education',
  github: 'GitHub',
  contact: 'Contact',
}

const str = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value))

function text(label: string, max: number, multiline = false, required = true): FieldDef {
  return { name: 'value', label, type: multiline ? 'textarea' : 'text', required, max, rows: multiline ? 4 : undefined }
}

/* ------------------------------------------------------------------ Hero */

type HeroTextKey = 'greeting' | 'role' | 'tagline' | 'resumeLabel' | 'focusLabel'

function heroText(id: string, key: HeroTextKey, label: string, max: number, multiline = false): EditTarget {
  return {
    id,
    group: 'Hero',
    label,
    styleable: true,
    fields: [text(label, max, multiline)],
    load: async () => ({ value: (await adminApi.hero())[key] }),
    save: async (v) => {
      const hero = await adminApi.hero()
      return adminApi.updateHero({ ...hero, [key]: v.value })
    },
    preview: (c, v) => {
      c.hero[key] = str(v.value)
    },
  }
}

function heroLink(id: string, which: 'primary' | 'secondary', label: string): EditTarget {
  const labelKey = `${which}CtaLabel` as const
  const hrefKey = `${which}CtaHref` as const
  return {
    id,
    group: 'Hero',
    label,
    styleable: true,
    fields: [
      { name: 'label', label: 'Button text', type: 'text', required: true, max: 60 },
      {
        name: 'href',
        label: 'Link destination',
        type: 'href',
        required: true,
        max: 500,
        hint: 'A section like #contact, a path like /page, a full web address or a mailto: link.',
      },
    ],
    load: async () => {
      const hero = await adminApi.hero()
      return { label: hero[labelKey], href: hero[hrefKey] }
    },
    save: async (v) => {
      const hero = await adminApi.hero()
      return adminApi.updateHero({ ...hero, [labelKey]: v.label, [hrefKey]: v.href })
    },
    preview: (c, v) => {
      c.hero[`${which}Cta`] = { label: str(v.label), href: str(v.href) }
    },
  }
}

/* --------------------------------------------------------------- Profile */

async function saveProfile(patch: FormValues) {
  const profile = await adminApi.profile()
  return adminApi.updateProfile({ ...profile, ...patch })
}

function profileText(
  id: string,
  key: 'preferredName' | 'title' | 'location' | 'copyrightText' | 'footerNote',
  group: string,
  label: string,
  max: number,
  apply: (c: PortfolioContent, value: string) => void,
): EditTarget {
  return {
    id,
    group,
    label,
    styleable: true,
    fields: [text(label, max)],
    load: async () => ({ value: (await adminApi.profile())[key] }),
    save: (v) => saveProfile({ [key]: v.value }),
    preview: (c, v) => apply(c, str(v.value)),
  }
}

/* -------------------------------------------------------------- Sections */

const sectionKey = (id: string) => id.toUpperCase() as SectionKey

async function saveSection(id: string, patch: Partial<{ navLabel: string; eyebrow: string; heading: string; intro: string | null; visible: boolean; settings: Record<string, string> }>) {
  const key = sectionKey(id)
  const section = (await adminApi.sections()).find((s) => s.key === key)
  if (!section) throw new Error(`Section ${key} not found`)
  return adminApi.updateSection(key, {
    navLabel: section.navLabel,
    eyebrow: section.eyebrow,
    heading: section.heading,
    intro: section.intro,
    visible: section.visible,
    settings: section.settings,
    ...patch,
  })
}

async function loadSection(id: string) {
  const section = (await adminApi.sections()).find((s) => s.key === sectionKey(id))
  if (!section) throw new Error(`Section ${id} not found`)
  return section
}

/** The public object for a section, e.g. content.skills for "skills". */
function sectionCopy(c: PortfolioContent, id: string): { eyebrow: string; heading: string; intro?: string | null } | null {
  switch (id) {
    case 'about':
      return c.about
    case 'skills':
      return c.skills
    case 'projects':
      return c.projects
    case 'journey':
      return c.journey
    case 'education':
      return c.education
    case 'github':
      return c.github
    case 'contact':
      return c.contact
    default:
      return null
  }
}

const MANAGE_FOR_SECTION: Partial<Record<string, ManagePage>> = {
  projects: 'projects',
  journey: 'experience',
  education: 'education',
  skills: 'skills',
  about: 'about',
}

function sectionField(id: string, field: 'eyebrow' | 'heading' | 'intro' | 'navLabel'): EditTarget {
  const name = SECTION_NAMES[id]
  const labels = { eyebrow: 'Eyebrow', heading: 'Heading', intro: 'Introduction', navLabel: 'Menu label' }
  const limits = { eyebrow: 80, heading: 160, intro: 500, navLabel: 40 }
  const manage = MANAGE_FOR_SECTION[id]
  return {
    id: `section.${id}.${field}`,
    group: name,
    label: labels[field],
    styleable: true,
    hint: field === 'navLabel' ? 'Shown in the top menu and the footer.' : undefined,
    fields: [
      text(labels[field], limits[field], field === 'intro', field !== 'intro'),
      {
        name: 'sectionVisible',
        label: `Show the ${name} section`,
        type: 'toggle',
        hint: 'Hidden sections disappear from the page and the menu.',
      },
    ],
    load: async () => {
      const section = await loadSection(id)
      return { value: section[field] ?? '', sectionVisible: section.visible }
    },
    save: (v) => saveSection(id, { [field]: v.value ?? null, visible: Boolean(v.sectionVisible) }),
    preview: (c, v) => {
      if (field === 'navLabel') {
        const item = c.navigation.find((n) => n.id === id)
        if (item) item.label = str(v.value)
      } else {
        const copy = sectionCopy(c, id)
        if (copy) copy[field] = str(v.value)
      }
      if (v.sectionVisible === false) {
        c.navigation = c.navigation.filter((n) => n.id !== id)
        ;(c as unknown as Record<string, unknown>)[id] = null
      }
    },
    extras: manage ? [{ kind: 'manage', label: `Manage ${name.toLowerCase()} content`, page: manage }] : undefined,
  }
}

function sectionSetting(
  id: string,
  sectionId: 'contact' | 'github',
  setting: string,
  label: string,
  apply: (c: PortfolioContent, value: string) => void,
): EditTarget {
  return {
    id,
    group: SECTION_NAMES[sectionId],
    label,
    styleable: true,
    fields: [text(label, 500)],
    load: async () => ({ value: (await loadSection(sectionId)).settings[setting] ?? '' }),
    save: async (v) => {
      const section = await loadSection(sectionId)
      return saveSection(sectionId, { settings: { ...section.settings, [setting]: str(v.value) } })
    },
    preview: (c, v) => apply(c, str(v.value)),
  }
}

/* ----------------------------------------------------------------- About */

function aboutTarget(id: string, index: number, kind: 'paragraph' | 'fact' | 'step'): EditTarget {
  const n = index + 1
  const base = {
    id,
    group: 'About',
    extras: [{ kind: 'manage', label: 'Add, remove or reorder About items', page: 'about' } as ExtraAction],
  }
  if (kind === 'paragraph') {
    return {
      ...base,
      label: `Paragraph ${n}`,
      styleable: true,
      fields: [text(`Paragraph ${n}`, 2000, true)],
      load: async () => ({ value: (await adminApi.about()).paragraphs[index] ?? '' }),
      save: async (v) => {
        const about = await adminApi.about()
        about.paragraphs[index] = str(v.value)
        return adminApi.updateAbout(about)
      },
      preview: (c, v) => {
        if (c.about) c.about.paragraphs[index] = str(v.value)
      },
    }
  }
  if (kind === 'fact') {
    return {
      ...base,
      label: `Fact ${n}`,
      styleable: true,
      fields: [
        { name: 'label', label: 'Label', type: 'text', required: true, max: 60 },
        { name: 'value', label: 'Value', type: 'text', required: true, max: 120 },
      ],
      load: async () => {
        const fact = (await adminApi.about()).facts[index]
        return { label: fact?.label ?? '', value: fact?.value ?? '' }
      },
      save: async (v) => {
        const about = await adminApi.about()
        about.facts[index] = { label: str(v.label), value: str(v.value) }
        return adminApi.updateAbout(about)
      },
      preview: (c, v) => {
        const fact = c.about?.facts[index]
        if (fact) Object.assign(fact, { label: str(v.label), value: str(v.value) })
      },
    }
  }
  return {
    ...base,
    label: `Step ${n}`,
    styleable: true,
    fields: [
      { name: 'step', label: 'Number', type: 'text', required: true, max: 10 },
      { name: 'title', label: 'Title', type: 'text', required: true, max: 80 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, max: 300, rows: 3 },
    ],
    load: async () => {
      const step = (await adminApi.about()).approach[index]
      return { step: step?.step ?? '', title: step?.title ?? '', description: step?.description ?? '' }
    },
    save: async (v) => {
      const about = await adminApi.about()
      about.approach[index] = { step: str(v.step), title: str(v.title), description: str(v.description) }
      return adminApi.updateAbout(about)
    },
    preview: (c, v) => {
      const step = c.about?.approach[index]
      if (step) Object.assign(step, { step: str(v.step), title: str(v.title), description: str(v.description) })
    },
  }
}

/* -------------------------------------------------------------- Projects */

const PUBLIC_STATUS: Record<Project['status'], PublicStatus> = {
  IN_DEVELOPMENT: 'in-development',
  COMPLETED: 'completed',
  PLANNED: 'planned',
}

async function findProject(id: string) {
  const project = (await adminApi.projects()).find((p) => p.id === id)
  if (!project) throw new Error('This project no longer exists.')
  return project
}

const projectOrder = (id: string): ExtraAction => ({
  kind: 'order',
  label: 'Project order',
  selfId: id,
  ids: async () => (await adminApi.projects()).map((p) => p.id),
  reorder: adminApi.reorderProjects,
})

function projectTarget(id: string, content: PortfolioContent): EditTarget {
  const name = content.projects?.items.find((p) => p.id === id)?.name ?? 'Project'
  return {
    id: `project.${id}`,
    group: 'Projects',
    label: name,
    hint: 'Turn off "Published" to hide the project from the site.',
    fields: PROJECT_FIELDS.map((f) => (f.name === 'visible' ? { ...f, label: 'Published (shown on the site)' } : f)),
    load: async () => ({ ...(await findProject(id)) }),
    save: (v) => adminApi.updateProject(id, v),
    preview: (c, v) => {
      if (!c.projects) return
      if (v.visible === false) {
        c.projects.items = c.projects.items.filter((p) => p.id !== id)
        return
      }
      const project = c.projects.items.find((p) => p.id === id)
      if (!project) return
      Object.assign(project, {
        name: str(v.name),
        summary: str(v.summary),
        description: str(v.description),
        highlights: (v.highlights as string[]) ?? [],
        tags: (v.tags as string[]) ?? [],
        repoUrl: (v.repoUrl as string | null) || null,
        demoUrl: (v.demoUrl as string | null) || null,
        featured: Boolean(v.featured),
        imageAlt: str(v.imageAlt),
        status: PUBLIC_STATUS[v.status as Project['status']] ?? project.status,
      })
    },
    extras: [
      { kind: 'image', label: 'Replace screenshot', upload: (file) => adminApi.uploadProjectImage(id, file) },
      projectOrder(id),
      { kind: 'manage', label: 'Add, delete or show hidden projects', page: 'projects' },
    ],
  }
}

function projectImageTarget(id: string, content: PortfolioContent): EditTarget {
  const name = content.projects?.items.find((p) => p.id === id)?.name ?? 'Project'
  return {
    id: `project.${id}.image`,
    group: `Projects · ${name}`,
    label: 'Screenshot',
    fields: [{ name: 'imageAlt', label: 'Image description', type: 'text', required: true, max: 200, hint: 'Read aloud by screen readers.' }],
    load: async () => ({ imageAlt: (await findProject(id)).imageAlt }),
    save: async (v) => {
      const project = await findProject(id)
      return adminApi.updateProject(id, { ...project, imageAlt: v.imageAlt })
    },
    preview: (c, v) => {
      const project = c.projects?.items.find((p) => p.id === id)
      if (project) project.imageAlt = str(v.imageAlt)
    },
    extras: [{ kind: 'image', label: 'Replace screenshot', upload: (file) => adminApi.uploadProjectImage(id, file) }],
  }
}

/* ---------------------------------------------------------------- Skills */

async function skillCategories() {
  return adminApi.skillCategories()
}

function skillGroupTarget(id: string, content: PortfolioContent): EditTarget {
  const title = content.skills?.groups.find((g) => g.id === id)?.title ?? 'Category'
  return {
    id: `skillgroup.${id}`,
    group: 'Skills',
    label: `Category · ${title}`,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 80 },
      { name: 'icon', label: 'Icon', type: 'select', required: true, options: ICONS },
      { name: 'description', label: 'Short description', type: 'text', required: true, max: 200 },
      { name: 'visible', label: 'Shown on the site', type: 'toggle' },
    ],
    load: async () => {
      const category = (await skillCategories()).find((c) => c.id === id)
      if (!category) throw new Error('This category no longer exists.')
      return { title: category.title, icon: category.icon, description: category.description, visible: category.visible }
    },
    save: (v) => adminApi.updateSkillCategory(id, v),
    preview: (c, v) => {
      if (!c.skills) return
      if (v.visible === false) {
        c.skills.groups = c.skills.groups.filter((g) => g.id !== id)
        return
      }
      const group = c.skills.groups.find((g) => g.id === id)
      if (group) {
        group.title = str(v.title)
        group.description = str(v.description)
        if (v.icon) group.icon = str(v.icon).toLowerCase() as typeof group.icon
      }
    },
    extras: [
      { kind: 'addSkill', categoryId: id },
      {
        kind: 'order',
        label: 'Category order',
        selfId: id,
        ids: async () => (await skillCategories()).map((c) => c.id),
        reorder: adminApi.reorderSkillCategories,
      },
      { kind: 'manage', label: 'Show hidden skills and categories', page: 'skills' },
    ],
  }
}

function skillTarget(id: string, content: PortfolioContent): EditTarget {
  const groups = content.skills?.groups ?? []
  const owner = groups.find((g) => g.skills.some((s) => s.id === id))
  const name = owner?.skills.find((s) => s.id === id)?.name ?? 'Skill'
  return {
    id: `skill.${id}`,
    group: 'Skills',
    label: `Skill · ${name}`,
    styleable: true,
    fields: [
      { name: 'name', label: 'Skill name', type: 'text', required: true, max: 80 },
      {
        name: 'categoryId',
        label: 'Category',
        type: 'select',
        required: true,
        options: groups.map((g) => ({ value: g.id, label: g.title })),
        hint: 'Moving a skill puts it at the end of the new category.',
      },
      { name: 'visible', label: 'Shown on the site', type: 'toggle' },
    ],
    load: async () => {
      for (const category of await skillCategories()) {
        const skill = category.skills.find((s) => s.id === id)
        if (skill) return { name: skill.name, categoryId: category.id, visible: skill.visible }
      }
      throw new Error('This skill no longer exists.')
    },
    save: (v) => adminApi.updateSkill(id, { name: str(v.name), categoryId: str(v.categoryId), visible: Boolean(v.visible) }),
    preview: (c, v) => {
      for (const group of c.skills?.groups ?? []) {
        if (v.visible === false) group.skills = group.skills.filter((s) => s.id !== id)
        const skill = group.skills.find((s) => s.id === id)
        if (skill) skill.name = str(v.name)
      }
    },
    extras: owner
      ? [
          {
            kind: 'order',
            label: `Order within ${owner.title}`,
            selfId: id,
            ids: async () => (await skillCategories()).find((c) => c.id === owner.id)?.skills.map((s) => s.id) ?? [],
            reorder: (ids) => adminApi.reorderSkills(owner.id, ids),
          },
        ]
      : undefined,
  }
}

/* ------------------------------------------------- Journey, education, links */

function journeyTarget(id: string, content: PortfolioContent): EditTarget {
  const title = content.journey?.entries.find((e) => e.id === id)?.title ?? 'Entry'
  const find = async () => {
    const entry = (await adminApi.experience()).find((e) => e.id === id)
    if (!entry) throw new Error('This entry no longer exists.')
    return entry
  }
  return {
    id: `journey.${id}`,
    group: 'Journey',
    label: title,
    fields: EXPERIENCE_FIELDS,
    load: async () => ({ ...(await find()) }),
    save: (v) => adminApi.updateExperience(id, v),
    preview: (c, v) => {
      if (!c.journey) return
      if (v.visible === false) {
        c.journey.entries = c.journey.entries.filter((e) => e.id !== id)
        return
      }
      const entry = c.journey.entries.find((e) => e.id === id)
      if (entry) {
        Object.assign(entry, {
          title: str(v.title),
          period: str(v.period),
          organisation: (v.organisation as string | null) || null,
          description: str(v.description),
        })
      }
    },
    extras: [
      {
        kind: 'order',
        label: 'Entry order',
        selfId: id,
        ids: async () => (await adminApi.experience()).map((e) => e.id),
        reorder: adminApi.reorderExperience,
      },
      { kind: 'manage', label: 'Add or delete journey entries', page: 'experience' },
    ],
  }
}

function educationTarget(id: string, content: PortfolioContent): EditTarget {
  const title = content.education?.entries.find((e) => e.id === id)?.degree ?? 'Entry'
  const find = async () => {
    const entry = (await adminApi.education()).find((e) => e.id === id)
    if (!entry) throw new Error('This entry no longer exists.')
    return entry
  }
  return {
    id: `education.${id}`,
    group: 'Education',
    label: title,
    fields: EDUCATION_FIELDS,
    load: async () => ({ ...(await find()) }),
    save: (v) => adminApi.updateEducation(id, v),
    preview: (c, v) => {
      if (!c.education) return
      if (v.visible === false) {
        c.education.entries = c.education.entries.filter((e) => e.id !== id)
        return
      }
      const entry = c.education.entries.find((e) => e.id === id)
      if (entry) {
        Object.assign(entry, {
          degree: str(v.degree),
          field: str(v.field),
          institution: (v.institution as string | null) || null,
          period: str(v.period),
          description: str(v.description),
        })
      }
    },
    extras: [
      {
        kind: 'order',
        label: 'Entry order',
        selfId: id,
        ids: async () => (await adminApi.education()).map((e) => e.id),
        reorder: adminApi.reorderEducation,
      },
      { kind: 'manage', label: 'Add or delete education entries', page: 'education' },
    ],
  }
}

function socialTarget(id: string, content: PortfolioContent): EditTarget {
  const label = content.socialLinks.find((l) => l.id === id)?.label ?? 'Link'
  const find = async () => {
    const link = (await adminApi.socialLinks()).find((l) => l.id === id)
    if (!link) throw new Error('This link no longer exists.')
    return link
  }
  return {
    id: `social.${id}`,
    group: 'Social links',
    label,
    fields: SOCIAL_FIELDS,
    load: async () => {
      const link = await find()
      return { ...link, url: link.url?.replace(/^mailto:/i, '') ?? '' }
    },
    save: (v) => adminApi.updateSocialLink(id, v),
    preview: (c, v) => {
      if (v.visible === false || !v.url) {
        c.socialLinks = c.socialLinks.filter((l) => l.id !== id)
        return
      }
      const link = c.socialLinks.find((l) => l.id === id)
      if (link) link.label = str(v.label)
    },
    extras: [
      {
        kind: 'order',
        label: 'Link order',
        selfId: id,
        ids: async () => (await adminApi.socialLinks()).map((l) => l.id),
        reorder: adminApi.reorderSocialLinks,
      },
      { kind: 'manage', label: 'Add or delete links', page: 'social-links' },
    ],
  }
}

/* ------------------------------------------------------------ Appearance */

export const APPEARANCE_ID = 'site.appearance'

const COLOR_HINT = 'Leave empty for the design default.'

function appearanceTarget(): EditTarget {
  return {
    id: APPEARANCE_ID,
    group: 'Site',
    label: 'Theme & appearance',
    hint: 'Applies to the whole site. Choose calm, readable combinations.',
    fields: [
      { name: 'colors', label: 'Colours', type: 'heading' },
      { name: 'accentColor', label: 'Accent colour', type: 'color', required: true },
      { name: 'backgroundColor', label: 'Background colour', type: 'color', hint: `${COLOR_HINT} Overrides the background tone.` },
      {
        name: 'backgroundStyle',
        label: 'Background tone',
        type: 'select',
        required: true,
        options: [
          { value: 'IVORY', label: 'Ivory (default)' },
          { value: 'CREAM', label: 'Warm cream' },
          { value: 'MIST', label: 'Sage mist' },
        ],
      },
      { name: 'textColor', label: 'Text colour', type: 'color', hint: COLOR_HINT },
      { name: 'type', label: 'Typography', type: 'heading' },
      {
        name: 'headingFont',
        label: 'Heading font',
        type: 'select',
        required: true,
        options: [
          { value: 'SANS', label: 'Outfit (modern sans)' },
          { value: 'SERIF', label: 'Instrument Serif (editorial)' },
        ],
      },
      {
        name: 'bodyFont',
        label: 'Body font',
        type: 'select',
        required: true,
        options: [
          { value: 'SANS', label: 'Outfit (modern sans)' },
          { value: 'SERIF', label: 'Instrument Serif (editorial)' },
        ],
      },
      { name: 'shape', label: 'Shape and motion', type: 'heading' },
      {
        name: 'cornerStyle',
        label: 'Corner radius',
        type: 'select',
        required: true,
        options: [
          { value: 'SHARP', label: 'Subtle' },
          { value: 'SOFT', label: 'Soft (default)' },
          { value: 'ROUND', label: 'Very round' },
        ],
      },
      { name: 'heroSceneEnabled', label: '3D hero scene', type: 'toggle' },
      { name: 'motionEnabled', label: 'Animations', type: 'toggle' },
    ],
    load: async () => {
      const a = await adminApi.appearance()
      return { ...a, bodyFont: a.bodyFont ?? 'SANS', cornerStyle: a.cornerStyle ?? 'SOFT' }
    },
    save: async (v) => {
      const current = await adminApi.appearance()
      return adminApi.updateAppearance({ ...current, ...v })
    },
    preview: (c, v) => {
      const lower = (x: unknown) => (typeof x === 'string' && x ? x.toLowerCase() : null)
      c.appearance = {
        ...c.appearance,
        accentColor: str(v.accentColor) || c.appearance.accentColor,
        backgroundColor: (v.backgroundColor as string | null) || null,
        backgroundStyle: lower(v.backgroundStyle) as typeof c.appearance.backgroundStyle,
        textColor: (v.textColor as string | null) || null,
        headingFont: lower(v.headingFont) as typeof c.appearance.headingFont,
        bodyFont: lower(v.bodyFont) as typeof c.appearance.bodyFont,
        cornerStyle: lower(v.cornerStyle) as typeof c.appearance.cornerStyle,
        heroSceneEnabled: Boolean(v.heroSceneEnabled),
        motionEnabled: Boolean(v.motionEnabled),
      }
    },
  }
}

/* -------------------------------------------------------------- Registry */

/** Resolves an editor id to its target, or null if it no longer exists. */
export function resolveTarget(id: string, content: PortfolioContent): EditTarget | null {
  if (id === APPEARANCE_ID) return appearanceTarget()
  const parts = id.split('.')
  const [head, second, third] = parts

  switch (head) {
    case 'hero':
      switch (second) {
        case 'greeting':
          return heroText(id, 'greeting', 'Greeting', 120)
        case 'role':
          return heroText(id, 'role', 'Role', 120)
        case 'tagline':
          return heroText(id, 'tagline', 'Tagline', 300, true)
        case 'resumeLabel':
          return heroText(id, 'resumeLabel', 'Resume link text', 60)
        case 'focusLabel':
          return heroText(id, 'focusLabel', 'Focus strip label', 60)
        case 'primaryCta':
          return heroLink(id, 'primary', 'Main button')
        case 'secondaryCta':
          return heroLink(id, 'secondary', 'Second button')
        case 'focusAreas':
          return {
            id,
            group: 'Hero',
            label: 'Focus areas',
            fields: [{ name: 'focusAreas', label: 'Focus areas', type: 'list', itemLabel: 'Focus area', max: 120, maxItems: 12 }],
            load: async () => ({ focusAreas: (await adminApi.hero()).focusAreas }),
            save: async (v) => {
              const hero = await adminApi.hero()
              return adminApi.updateHero({ ...hero, focusAreas: v.focusAreas })
            },
            preview: (c, v) => {
              c.hero.focusAreas = ((v.focusAreas as string[]) ?? []).filter(Boolean)
            },
          }
      }
      return null
    case 'profile':
      switch (second) {
        case 'preferredName':
          return profileText(id, 'preferredName', 'Site', 'Name (menu and footer)', 60, (c, v) => {
            c.profile.preferredName = v
          })
        case 'title':
          return profileText(id, 'title', 'Footer', 'Professional title', 160, (c, v) => {
            c.profile.title = v
          })
        case 'location':
          return profileText(id, 'location', 'Profile', 'Location', 120, (c, v) => {
            c.profile.location = v
          })
        case 'availability':
          return {
            id,
            group: 'Hero',
            label: 'Availability',
            styleable: true,
            fields: [
              { name: 'availabilityLabel', label: 'Availability text', type: 'text', required: true, max: 120 },
              { name: 'available', label: 'Available (pulsing green dot)', type: 'toggle' },
            ],
            load: async () => {
              const p = await adminApi.profile()
              return { availabilityLabel: p.availabilityLabel, available: p.available }
            },
            save: (v) => saveProfile({ availabilityLabel: v.availabilityLabel, available: v.available }),
            preview: (c, v) => {
              c.profile.availability = { label: str(v.availabilityLabel), available: Boolean(v.available) }
            },
          }
        case 'photo':
          return {
            id,
            group: 'Hero',
            label: 'Profile photo',
            fields: [{ name: 'photoAlt', label: 'Photo description', type: 'text', required: true, max: 200, hint: 'Read aloud by screen readers.' }],
            load: async () => ({ photoAlt: (await adminApi.profile()).photoAlt }),
            save: (v) => saveProfile({ photoAlt: v.photoAlt }),
            preview: (c, v) => {
              c.profile.photoAlt = str(v.photoAlt)
            },
            extras: [{ kind: 'image', label: 'Replace photo', upload: adminApi.uploadPhoto }],
          }
      }
      return null
    case 'footer':
      if (second === 'copyright') {
        return profileText(id, 'copyrightText', 'Footer', 'Copyright line', 200, (c, v) => {
          c.footer.copyright = v
        })
      }
      if (second === 'note') {
        return profileText(id, 'footerNote', 'Footer', 'Footer note', 200, (c, v) => {
          c.footer.note = v
        })
      }
      return null
    case 'section':
      if (SECTION_IDS.includes(second as SectionId) && ['eyebrow', 'heading', 'intro', 'navLabel'].includes(third)) {
        return sectionField(second, third as 'eyebrow' | 'heading' | 'intro' | 'navLabel')
      }
      return null
    case 'contact':
      if (second === 'formHeading') {
        return sectionSetting(id, 'contact', 'formHeading', 'Form heading', (c, v) => {
          if (c.contact) c.contact.formHeading = v
        })
      }
      if (second === 'submitLabel') {
        return sectionSetting(id, 'contact', 'submitLabel', 'Send button text', (c, v) => {
          if (c.contact) c.contact.submitLabel = v
        })
      }
      return null
    case 'github':
      return second === 'emptyMessage'
        ? sectionSetting(id, 'github', 'emptyMessage', 'Message before a username is set', (c, v) => {
            if (c.github) c.github.emptyMessage = v
          })
        : null
    case 'about': {
      if (second === 'approachHeading') {
        return {
          id,
          group: 'About',
          label: '"How I work" heading',
          styleable: true,
          fields: [text('Heading', 120)],
          load: async () => ({ value: (await adminApi.about()).approachHeading }),
          save: async (v) => {
            const about = await adminApi.about()
            return adminApi.updateAbout({ ...about, approachHeading: v.value })
          },
          preview: (c, v) => {
            if (c.about) c.about.approachHeading = str(v.value)
          },
        }
      }
      const index = Number(third)
      if (!Number.isInteger(index)) return null
      if (second === 'paragraph' && content.about?.paragraphs[index] != null) return aboutTarget(id, index, 'paragraph')
      if (second === 'fact' && content.about?.facts[index]) return aboutTarget(id, index, 'fact')
      if (second === 'step' && content.about?.approach[index]) return aboutTarget(id, index, 'step')
      return null
    }
    case 'project': {
      const uuid = parts.slice(1, third === 'image' ? -1 : undefined).join('.')
      if (!content.projects?.items.some((p) => p.id === uuid)) return null
      return parts[parts.length - 1] === 'image' ? projectImageTarget(uuid, content) : projectTarget(uuid, content)
    }
    case 'skillgroup':
      return content.skills?.groups.some((g) => g.id === second) ? skillGroupTarget(second, content) : null
    case 'skill':
      return content.skills?.groups.some((g) => g.skills.some((s) => s.id === second)) ? skillTarget(second, content) : null
    case 'journey':
      return content.journey?.entries.some((e) => e.id === second) ? journeyTarget(second, content) : null
    case 'education':
      return content.education?.entries.some((e) => e.id === second) ? educationTarget(second, content) : null
    case 'social':
      return content.socialLinks.some((l) => l.id === second) ? socialTarget(second, content) : null
    default:
      return null
  }
}

/** Short name for the hover badge: "Hero · Greeting". */
export function describeTarget(id: string, content: PortfolioContent): string {
  const target = resolveTarget(id, content)
  return target ? `${target.group} · ${target.label}` : id
}

/* ------------------------------------------------------ Element formatting */

export const STYLE_FIELDS: FieldDef[] = [
  { name: 'formatting', label: 'Formatting', type: 'heading', hint: 'Applies to this element only.' },
  { name: 'styleColor', label: 'Text colour', type: 'color', hint: 'Leave empty for the design colour.' },
  {
    name: 'styleSize',
    label: 'Size',
    type: 'select',
    options: [
      { value: '0.75', label: 'Smaller (75%)' },
      { value: '0.88', label: 'Small (88%)' },
      { value: '1.13', label: 'Large (113%)' },
      { value: '1.25', label: 'Larger (125%)' },
      { value: '1.5', label: 'Largest (150%)' },
    ],
  },
  {
    name: 'styleWeight',
    label: 'Weight',
    type: 'select',
    options: [
      { value: '300', label: 'Light' },
      { value: '400', label: 'Regular' },
      { value: '500', label: 'Medium' },
      { value: '600', label: 'Semibold' },
      { value: '700', label: 'Bold' },
    ],
  },
  {
    name: 'styleAlign',
    label: 'Alignment',
    type: 'select',
    options: [
      { value: 'start', label: 'Left' },
      { value: 'center', label: 'Centre' },
      { value: 'end', label: 'Right' },
    ],
  },
  {
    name: 'styleFont',
    label: 'Font',
    type: 'select',
    options: [
      { value: 'sans', label: 'Outfit (sans)' },
      { value: 'serif', label: 'Instrument Serif' },
    ],
  },
]

export function styleToForm(style: ElementStyle | undefined | null): FormValues {
  return {
    styleColor: style?.color ?? '',
    styleSize: style?.fontScale != null ? String(style.fontScale) : '',
    styleWeight: style?.fontWeight != null ? String(style.fontWeight) : '',
    styleAlign: style?.textAlign ?? '',
    styleFont: style?.fontFamily ?? '',
  }
}

export function formToStyle(values: FormValues): ElementStyle {
  const pick = (key: string) => {
    const value = values[key]
    return typeof value === 'string' && value !== '' ? value : null
  }
  return {
    color: pick('styleColor'),
    fontScale: pick('styleSize') ? Number(pick('styleSize')) : null,
    fontWeight: pick('styleWeight') ? Number(pick('styleWeight')) : null,
    textAlign: pick('styleAlign') as ElementStyle['textAlign'],
    fontFamily: pick('styleFont') as ElementStyle['fontFamily'],
  }
}

export function isEmptyStyle(style: ElementStyle) {
  return !style.color && !style.fontScale && !style.fontWeight && !style.textAlign && !style.fontFamily
}

/** Content with unsaved edits applied (never mutates the original). */
export function applyLiveEdit(content: PortfolioContent, target: EditTarget | null, values: FormValues | null): PortfolioContent {
  if (!target || !values) return content
  const copy = structuredClone(content)
  target.preview?.(copy, values)
  if (target.styleable) {
    const style = formToStyle(values)
    const styles = { ...(copy.styles ?? {}) }
    if (isEmptyStyle(style)) delete styles[target.id]
    else styles[target.id] = style
    copy.styles = styles
  }
  return copy
}

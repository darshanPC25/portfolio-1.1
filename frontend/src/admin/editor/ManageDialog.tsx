import type { ComponentType } from 'react'
import { Dialog } from '../components/Dialog'
import { AboutPage } from '../pages/AboutPage'
import { EducationPage } from '../pages/EducationPage'
import { ExperiencePage } from '../pages/ExperiencePage'
import { HeroPage } from '../pages/HeroPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { SkillsPage } from '../pages/SkillsPage'
import { SocialLinksPage } from '../pages/SocialLinksPage'
import type { ManagePage } from './targets'

const PAGES: Record<ManagePage, { title: string; component: ComponentType }> = {
  projects: { title: 'Manage projects', component: ProjectsPage },
  experience: { title: 'Manage journey entries', component: ExperiencePage },
  education: { title: 'Manage education', component: EducationPage },
  'social-links': { title: 'Manage social links', component: SocialLinksPage },
  skills: { title: 'Manage skills', component: SkillsPage },
  about: { title: 'Manage About content', component: AboutPage },
  hero: { title: 'Manage hero content', component: HeroPage },
}

/**
 * Structural changes (adding, deleting, showing hidden items) without leaving
 * the editor. Uses the same studio pages, so there is one implementation.
 */
export function ManageDialog({ page, onClose }: { page: ManagePage | null; onClose: () => void }) {
  const entry = page ? PAGES[page] : null
  const Page = entry?.component
  return (
    <Dialog
      open={page !== null}
      onClose={onClose}
      title={entry?.title ?? ''}
      description="Changes save to the draft. Close this window to see them in the editor."
      size="lg"
    >
      {Page && <Page />}
    </Dialog>
  )
}

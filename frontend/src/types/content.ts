/**
 * Content model for the public portfolio.
 *
 * Everything the site displays is described here so the same shapes can be
 * served by the backend later without changing any component.
 */

export type SectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'journey'
  | 'education'
  | 'github'
  | 'contact'

export interface NavItem {
  id: SectionId
  label: string
}

export interface CallToAction {
  label: string
  href: string
}

export interface SectionCopy {
  eyebrow: string
  heading: string
  intro?: string
}

export interface Profile {
  fullName: string
  preferredName: string
  title: string
  location: string
  photoUrl: string
  photoAlt: string
  /** null until a resume has been uploaded */
  resumeUrl: string | null
  /** null until a public contact address has been chosen */
  email: string | null
  availability: {
    available: boolean
    label: string
  }
}

export interface HeroContent {
  greeting: string
  role: string
  tagline: string
  primaryCta: CallToAction
  secondaryCta: CallToAction
  resumeLabel: string
  focusLabel: string
  focusAreas: string[]
}

export interface AboutContent extends SectionCopy {
  paragraphs: string[]
  facts: { id: string; label: string; value: string }[]
  approachHeading: string
  approach: { id: string; step: string; title: string; description: string }[]
}

export type SkillIcon = 'code' | 'server' | 'database' | 'network' | 'tools'

export interface SkillGroup {
  id: string
  title: string
  icon: SkillIcon
  description: string
  skills: { id: string; name: string }[]
  order: number
}

export type ProjectStatus = 'in-development' | 'completed' | 'planned'

export interface Project {
  id: string
  name: string
  summary: string
  description: string
  highlights: string[]
  tags: string[]
  imageUrl: string
  imageAlt: string
  status: ProjectStatus
  /** null until a real repository URL is provided */
  repoUrl: string | null
  /** null until a real demo URL is provided */
  demoUrl: string | null
  featured: boolean
  order: number
}

export interface JourneyEntry {
  id: string
  period: string
  title: string
  organisation: string | null
  description: string
  order: number
}

export interface EducationEntry {
  id: string
  degree: string
  field: string
  institution: string | null
  period: string
  description: string
  order: number
}

export type SocialPlatform = 'github' | 'linkedin' | 'email' | 'website'

export interface SocialLink {
  id: string
  platform: SocialPlatform
  label: string
  /** null until a real URL is provided; links without a URL are not rendered */
  url: string | null
}

export interface GitHubContent extends SectionCopy {
  /** null until a GitHub username is provided */
  username: string | null
  emptyMessage: string
}

export interface ContactContent extends SectionCopy {
  formHeading: string
  submitLabel: string
}

export interface FooterContent {
  copyright: string
  loginLabel: string
  loginHref: string
  note: string
}

export interface PortfolioContent {
  profile: Profile
  navigation: NavItem[]
  hero: HeroContent
  about: AboutContent
  skills: SectionCopy & { groups: SkillGroup[] }
  projects: SectionCopy & { items: Project[] }
  journey: SectionCopy & { entries: JourneyEntry[] }
  education: SectionCopy & { entries: EducationEntry[] }
  github: GitHubContent
  contact: ContactContent
  socialLinks: SocialLink[]
  footer: FooterContent
}

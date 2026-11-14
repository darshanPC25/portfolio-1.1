/**
 * Content model for the public portfolio.
 *
 * Mirrors the backend's published snapshot (`GET /api/v1/portfolio`). A
 * section is `null` when it has been hidden in the CMS.
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
  intro?: string | null
}

export interface Profile {
  fullName: string
  preferredName: string
  title: string
  location: string
  photoUrl: string | null
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
  slug: string
  name: string
  summary: string
  description: string
  highlights: string[]
  tags: string[]
  imageUrl: string | null
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
  url: string | null
}

export interface GitHubContent extends SectionCopy {
  /** null until a GitHub username is provided */
  username: string | null
  emptyMessage: string | null
}

export interface ContactContent extends SectionCopy {
  formHeading: string | null
  submitLabel: string | null
}

export interface FooterContent {
  copyright: string
  loginLabel: string
  loginHref: string
  note: string
}

export interface AppearanceSettings {
  /** Hex accent colour; null in snapshots published before it existed. */
  accentColor?: string | null
  backgroundStyle?: 'ivory' | 'cream' | 'mist' | null
  headingFont?: 'sans' | 'serif' | null
  heroSceneEnabled: boolean
  motionEnabled: boolean
}

export interface SeoSettings {
  title: string
  description: string
  canonicalUrl: string | null
  ogImageUrl: string | null
  allowIndexing: boolean
}

export interface PortfolioContent {
  /** Publication version this content came from. */
  version: number
  publishedAt: string
  profile: Profile
  navigation: NavItem[]
  hero: HeroContent
  about: AboutContent | null
  skills: (SectionCopy & { groups: SkillGroup[] }) | null
  projects: (SectionCopy & { items: Project[] }) | null
  journey: (SectionCopy & { entries: JourneyEntry[] }) | null
  education: (SectionCopy & { entries: EducationEntry[] }) | null
  github: GitHubContent | null
  contact: ContactContent | null
  socialLinks: SocialLink[]
  footer: FooterContent
  appearance: AppearanceSettings
  seo: SeoSettings
}

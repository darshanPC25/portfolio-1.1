/** Shapes of the Portfolio Studio API (mirror the backend admin DTOs). */

export interface AdminSession {
  id: string
  email: string
  displayName: string
  lastLoginAt: string | null
  csrfToken?: string | null
}

export interface Asset {
  id: string
  url: string
  filename: string
  contentType: string
  sizeBytes: number | null
  width: number | null
  height: number | null
  uploadedAt: string | null
}

export interface Overview {
  projects: { total: number; published: number }
  skills: number
  skillCategories: number
  sections: { visible: number; hidden: number }
  messages: { total: number; unread: number }
  draftLastChangedAt: string | null
  lastPublication: { version: number; publishedAt: string } | null
  hasUnpublishedChanges: boolean
}

export interface Publication {
  version: number
  publishedAt: string
  note: string | null
  publishedBy: string | null
}

export interface Profile {
  fullName: string
  preferredName: string
  title: string
  location: string
  photo: Asset | null
  /** Optional photo for the dark theme. */
  photoDark: Asset | null
  photoAlt: string
  resume: Asset | null
  publicEmail: string | null
  available: boolean
  availabilityLabel: string
  githubUsername: string | null
  copyrightText: string
  footerNote: string
  updatedAt: string | null
}

export interface Hero {
  greeting: string
  role: string
  tagline: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  resumeLabel: string
  focusLabel: string
  focusAreas: string[]
  updatedAt?: string | null
}

export interface About {
  paragraphs: string[]
  facts: { label: string; value: string }[]
  approachHeading: string
  approach: { step: string; title: string; description: string }[]
  updatedAt?: string | null
}

export type SectionKey = 'ABOUT' | 'SKILLS' | 'PROJECTS' | 'JOURNEY' | 'EDUCATION' | 'GITHUB' | 'CONTACT'

export interface Section {
  key: SectionKey
  navLabel: string
  eyebrow: string
  heading: string
  intro: string | null
  visible: boolean
  order: number
  settings: Record<string, string>
  allowedSettings: string[]
}

export type SkillIcon = 'CODE' | 'SERVER' | 'DATABASE' | 'NETWORK' | 'TOOLS'

export interface SkillItem {
  id: string
  name: string
  visible: boolean
  order: number
}

export interface SkillCategory {
  id: string
  title: string
  icon: SkillIcon
  description: string
  visible: boolean
  order: number
  skills: SkillItem[]
}

export type ProjectStatus = 'IN_DEVELOPMENT' | 'COMPLETED' | 'PLANNED'

export interface Project {
  id: string
  slug: string
  name: string
  summary: string
  description: string
  highlights: string[]
  tags: string[]
  image: Asset | null
  imageAlt: string
  status: ProjectStatus
  repoUrl: string | null
  demoUrl: string | null
  featured: boolean
  visible: boolean
  order: number
  updatedAt: string | null
}

export interface Experience {
  id: string
  period: string
  title: string
  organisation: string | null
  description: string
  startDate: string | null
  endDate: string | null
  visible: boolean
  order: number
  updatedAt: string | null
}

export interface Education {
  id: string
  degree: string
  field: string
  institution: string | null
  period: string
  description: string
  visible: boolean
  order: number
  updatedAt: string | null
}

export type SocialPlatform = 'GITHUB' | 'LINKEDIN' | 'EMAIL' | 'WEBSITE'

export interface SocialLink {
  id: string
  platform: SocialPlatform
  label: string
  url: string | null
  visible: boolean
  order: number
  updatedAt: string | null
}

export type BackgroundStyle = 'IVORY' | 'CREAM' | 'MIST'
export type HeadingFont = 'SANS' | 'SERIF'

export interface Appearance {
  accentColor: string
  backgroundStyle: BackgroundStyle
  headingFont: HeadingFont
  heroSceneEnabled: boolean
  motionEnabled: boolean
  updatedAt?: string | null
  backgroundColor?: string | null
  textColor?: string | null
  bodyFont?: HeadingFont
  cornerStyle?: 'SHARP' | 'SOFT' | 'ROUND'
}

export interface Seo {
  title: string
  description: string
  canonicalUrl: string | null
  allowIndexing: boolean
  ogImage: Asset | null
  updatedAt: string | null
}

export type MessageStatus = 'NEW' | 'READ' | 'ARCHIVED'

export interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: MessageStatus
  receivedAt: string
  readAt: string | null
  /** Whether the notification email went out. */
  emailStatus: EmailStatus
  emailedAt: string | null
  emailError: string | null
}

export type EmailStatus = 'NOT_SENT' | 'PENDING' | 'SENT' | 'FAILED'

/** Email notification settings. SMTP credentials live only on the server. */
export interface NotificationSettings {
  emailEnabled: boolean
  recipientEmail: string | null
  effectiveRecipient: string | null
  smtpConfigured: boolean
  smtpHost: string | null
  fromAddress: string | null
  updatedAt: string | null
}

export interface MessagePage {
  items: Message[]
  total: number
  page: number
  size: number
}

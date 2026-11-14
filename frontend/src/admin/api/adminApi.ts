import { normalizeContent } from '@/services/contentService'
import type { ElementStyle, PortfolioContent } from '@/types/content'
import { adminClient, setCsrfToken } from './adminClient'
import type {
  About,
  AdminSession,
  Appearance,
  Asset,
  Education,
  Experience,
  Hero,
  MessagePage,
  Message,
  MessageStatus,
  Overview,
  Profile,
  Project,
  Publication,
  Section,
  SectionKey,
  Seo,
  SkillCategory,
  SocialLink,
} from './types'

const data = <T>(promise: Promise<{ data: T }>) => promise.then((response) => response.data)

function upload<T>(url: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return data<T>(adminClient.post(url, form))
}

/** Every Portfolio Studio endpoint, typed. */
export const adminApi = {
  // Authentication and account
  async login(email: string, password: string) {
    const session = await data<AdminSession>(adminClient.post('/auth/login', { email, password }))
    setCsrfToken(session.csrfToken ?? null)
    return session
  },
  async logout() {
    await adminClient.post('/auth/logout')
    setCsrfToken(null)
  },
  me: () => data<AdminSession>(adminClient.get('/auth/me')),
  updateAccount: (body: { displayName: string; email: string; currentPassword: string }) =>
    data<AdminSession>(adminClient.put('/account', body)),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    adminClient.put('/account/password', body).then(() => undefined),

  // Overview and publishing
  overview: () => data<Overview>(adminClient.get('/overview')),
  publications: () => data<Publication[]>(adminClient.get('/publications')),
  publish: (note: string | null) => data<Publication>(adminClient.post('/publications', { note })),

  // Profile, photo and resume
  profile: () => data<Profile>(adminClient.get('/profile')),
  updateProfile: (body: unknown) => data<Profile>(adminClient.put('/profile', body)),
  uploadPhoto: (file: File) => upload<Profile>('/profile/photo', file),
  resume: () => data<{ resume: Asset | null }>(adminClient.get('/resume')),
  uploadResume: (file: File) => upload<Asset>('/resume', file),
  removeResume: () => adminClient.delete('/resume').then(() => undefined),

  // Site content
  hero: () => data<Hero>(adminClient.get('/hero')),
  updateHero: (body: unknown) => data<Hero>(adminClient.put('/hero', body)),
  about: () => data<About>(adminClient.get('/about')),
  updateAbout: (body: unknown) => data<About>(adminClient.put('/about', body)),
  sections: () => data<Section[]>(adminClient.get('/sections')),
  updateSection: (key: SectionKey, body: unknown) => data<Section>(adminClient.put(`/sections/${key}`, body)),
  reorderSections: (keys: SectionKey[]) => data<Section[]>(adminClient.put('/sections/order', { keys })),
  appearance: () => data<Appearance>(adminClient.get('/appearance')),
  updateAppearance: (body: unknown) => data<Appearance>(adminClient.put('/appearance', body)),
  seo: () => data<Seo>(adminClient.get('/seo')),
  updateSeo: (body: unknown) => data<Seo>(adminClient.put('/seo', body)),
  uploadOgImage: (file: File) => upload<Seo>('/seo/og-image', file),
  removeOgImage: () => data<Seo>(adminClient.delete('/seo/og-image')),

  // Projects
  projects: () => data<Project[]>(adminClient.get('/projects')),
  createProject: (body: unknown) => data<Project>(adminClient.post('/projects', body)),
  updateProject: (id: string, body: unknown) => data<Project>(adminClient.put(`/projects/${id}`, body)),
  deleteProject: (id: string) => adminClient.delete(`/projects/${id}`).then(() => undefined),
  reorderProjects: (ids: string[]) => data<Project[]>(adminClient.put('/projects/order', { ids })),
  setProjectVisible: (id: string, visible: boolean) =>
    data<Project>(adminClient.patch(`/projects/${id}/visibility`, { visible })),
  uploadProjectImage: (id: string, file: File) => upload<Project>(`/projects/${id}/image`, file),

  // Skills
  skillCategories: () => data<SkillCategory[]>(adminClient.get('/skill-categories')),
  createSkillCategory: (body: unknown) => data<SkillCategory>(adminClient.post('/skill-categories', body)),
  updateSkillCategory: (id: string, body: unknown) =>
    data<SkillCategory>(adminClient.put(`/skill-categories/${id}`, body)),
  deleteSkillCategory: (id: string) => adminClient.delete(`/skill-categories/${id}`).then(() => undefined),
  reorderSkillCategories: (ids: string[]) =>
    data<SkillCategory[]>(adminClient.put('/skill-categories/order', { ids })),
  createSkill: (categoryId: string, body: { name: string; visible: boolean }) =>
    data<SkillCategory>(adminClient.post(`/skill-categories/${categoryId}/skills`, body)),
  updateSkill: (id: string, body: { name: string; visible: boolean; categoryId: string }) =>
    data<SkillCategory[]>(adminClient.put(`/skills/${id}`, body)),
  deleteSkill: (id: string) => adminClient.delete(`/skills/${id}`).then(() => undefined),
  reorderSkills: (categoryId: string, ids: string[]) =>
    data<SkillCategory>(adminClient.put(`/skill-categories/${categoryId}/skills/order`, { ids })),

  // Experience, education, social links
  experience: () => data<Experience[]>(adminClient.get('/experience')),
  createExperience: (body: unknown) => data<Experience>(adminClient.post('/experience', body)),
  updateExperience: (id: string, body: unknown) => data<Experience>(adminClient.put(`/experience/${id}`, body)),
  deleteExperience: (id: string) => adminClient.delete(`/experience/${id}`).then(() => undefined),
  reorderExperience: (ids: string[]) => data<Experience[]>(adminClient.put('/experience/order', { ids })),

  education: () => data<Education[]>(adminClient.get('/education')),
  createEducation: (body: unknown) => data<Education>(adminClient.post('/education', body)),
  updateEducation: (id: string, body: unknown) => data<Education>(adminClient.put(`/education/${id}`, body)),
  deleteEducation: (id: string) => adminClient.delete(`/education/${id}`).then(() => undefined),
  reorderEducation: (ids: string[]) => data<Education[]>(adminClient.put('/education/order', { ids })),

  socialLinks: () => data<SocialLink[]>(adminClient.get('/social-links')),
  createSocialLink: (body: unknown) => data<SocialLink>(adminClient.post('/social-links', body)),
  updateSocialLink: (id: string, body: unknown) => data<SocialLink>(adminClient.put(`/social-links/${id}`, body)),
  deleteSocialLink: (id: string) => adminClient.delete(`/social-links/${id}`).then(() => undefined),
  reorderSocialLinks: (ids: string[]) => data<SocialLink[]>(adminClient.put('/social-links/order', { ids })),

  // Visual editor
  /** The draft, in the public content shape (what the site would show if published now). */
  preview: () => data<PortfolioContent>(adminClient.get('/preview')).then(normalizeContent),
  elementStyles: () => data<Record<string, ElementStyle>>(adminClient.get('/element-styles')),
  putElementStyle: (key: string, style: ElementStyle) =>
    adminClient.put(`/element-styles/${encodeURIComponent(key)}`, style).then(() => undefined),

  // Messages
  messages: (status: MessageStatus | null, page: number) =>
    data<MessagePage>(adminClient.get('/messages', { params: { status: status ?? undefined, page, size: 20 } })),
  setMessageStatus: (id: string, status: MessageStatus) =>
    data<Message>(adminClient.patch(`/messages/${id}`, { status })),
  deleteMessage: (id: string) => adminClient.delete(`/messages/${id}`).then(() => undefined),
}

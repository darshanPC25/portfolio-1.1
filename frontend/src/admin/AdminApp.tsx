import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SiteStatus } from '@/components/UI/SiteStatus'
import { getApiProblem } from '@/services/apiClient'
import { adminApi } from './api/adminApi'
import { UNAUTHORIZED_EVENT } from './api/adminClient'
import { adminKeys } from './api/queries'
import { AdminLayout } from './components/AdminLayout'
import { ToastProvider } from './components/Toast'
import { AboutPage } from './pages/AboutPage'
import { AppearancePage } from './pages/AppearancePage'
import { EducationPage } from './pages/EducationPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { HeroPage } from './pages/HeroPage'
import { MessagesPage } from './pages/MessagesPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ResumePage } from './pages/ResumePage'
import { SeoPage } from './pages/SeoPage'
import { SettingsPage } from './pages/SettingsPage'
import { SkillsPage } from './pages/SkillsPage'
import { SocialLinksPage } from './pages/SocialLinksPage'

/** Portfolio Studio (everything under /admin except the login page). Signed-in administrators only. */
export default function AdminApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useQuery({ queryKey: adminKeys.session, queryFn: adminApi.me, retry: false, staleTime: 5 * 60_000 })

  // Any request that finds the session expired sends the user back to sign in.
  useEffect(() => {
    const onUnauthorized = () => {
      queryClient.removeQueries({ queryKey: adminKeys.all })
      navigate(`/admin/login?expired=1&next=${encodeURIComponent(location.pathname)}`, { replace: true })
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [navigate, queryClient, location.pathname])

  if (session.isPending) return <SiteStatus state="loading" label="Opening Portfolio Studio…" />

  if (session.isError) {
    const status = getApiProblem(session.error)?.status
    if (status === 401 || status === 403) {
      return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />
    }
    return <SiteStatus state="error" onRetry={() => session.refetch()} retrying={session.isRefetching} />
  }

  return (
    <ToastProvider>
      <Routes>
        <Route element={<AdminLayout session={session.data} />}>
          <Route index element={<OverviewPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="hero" element={<HeroPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="social-links" element={<SocialLinksPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="seo" element={<SeoPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="settings" element={<SettingsPage session={session.data} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

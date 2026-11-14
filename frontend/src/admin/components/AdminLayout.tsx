import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Palette,
  Search,
  Settings,
  Share2,
  Sparkles,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { adminApi } from '../api/adminApi'
import { adminKeys } from '../api/queries'
import type { AdminSession } from '../api/types'
import { PublishControl } from './PublishControl'
import { StudioButton } from './ui'

export const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
  { to: '/admin/hero', label: 'Hero', icon: Sparkles },
  { to: '/admin/about', label: 'About', icon: BookOpen },
  { to: '/admin/skills', label: 'Skills', icon: Wrench },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { to: '/admin/resume', label: 'Resume', icon: FileText },
  { to: '/admin/appearance', label: 'Appearance', icon: Palette },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function Sidebar({ unread, onNavigate }: { unread: number; onNavigate?: () => void }) {
  return (
    <nav aria-label="Studio" className="flex h-full flex-col">
      <Link to="/admin" onClick={onNavigate} className="px-3 pt-1 pb-6">
        <span className="block font-serif text-3xl leading-none text-forest italic">Darshan</span>
        <span className="mt-1 block text-xs font-medium tracking-[0.18em] text-muted uppercase">Portfolio Studio</span>
      </Link>
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto pb-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/admin'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex min-h-10 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition-colors duration-200',
                  isActive ? 'bg-forest text-ivory shadow-button' : 'text-forest hover:bg-forest/8',
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {label === 'Messages' && unread > 0 && (
                <span className="rounded-full bg-[#c99a2e] px-2 py-0.5 text-xs font-semibold text-ivory">
                  {unread}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Studio frame: sidebar (drawer on small screens), top bar with publishing and account. */
export function AdminLayout({ session }: { session: AdminSession }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const overview = useQuery({ queryKey: adminKeys.overview, queryFn: adminApi.overview })
  const unread = overview.data?.messages.unread ?? 0

  useEffect(() => setDrawerOpen(false), [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const signOut = async () => {
    setSigningOut(true)
    try {
      await adminApi.logout()
    } finally {
      queryClient.removeQueries({ queryKey: adminKeys.all })
      navigate('/admin/login', { replace: true, state: { signedOut: true } })
    }
  }

  return (
    <div className="min-h-svh bg-cream/60 text-ink">
      <a
        href="#studio-main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-forest focus-visible:px-4 focus-visible:py-2 focus-visible:text-ivory"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sand/70 bg-ivory px-3 py-6 lg:block">
        <Sidebar unread={unread} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-pine/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside id="studio-drawer" className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ivory px-3 py-6 shadow-lift">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-3 rounded-full p-2 text-moss hover:bg-forest/8"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <Sidebar unread={unread} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-sand/70 bg-ivory/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="rounded-full p-2 text-forest hover:bg-forest/8 lg:hidden"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="studio-drawer"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="flex-1" />
            <PublishControl />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-forest hover:bg-forest/8 md:inline-flex"
            >
              View site
              <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <div className="hidden text-right text-xs leading-tight text-muted xl:block">
              <span className="block font-medium text-forest">{session.displayName}</span>
              {session.email}
            </div>
            <StudioButton
              size="sm"
              variant="ghost"
              icon={<LogOut size={16} aria-hidden="true" />}
              loading={signingOut}
              onClick={signOut}
            >
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </StudioButton>
          </div>
        </header>

        <main id="studio-main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

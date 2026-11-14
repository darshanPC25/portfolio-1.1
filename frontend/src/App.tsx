import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { NoIndex } from '@/components/UI/NoIndex'
import { SiteStatus } from '@/components/UI/SiteStatus'
import { ContentProvider } from '@/contexts/ContentContext'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

// The studio is a separate bundle: visitors to the portfolio never download it.
const LoginPage = lazy(() => import('@/admin/pages/LoginPage'))
const AdminApp = lazy(() => import('@/admin/AdminApp'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<SiteStatus state="loading" label="Loading…" />}>
          <Routes>
            <Route
              path="/"
              element={
                <ContentProvider>
                  <Home />
                </ContentProvider>
              }
            />
            <Route
              path="/admin/login"
              element={
                <NoIndex>
                  <LoginPage />
                </NoIndex>
              }
            />
            <Route
              path="/admin/*"
              element={
                <NoIndex>
                  <AdminApp />
                </NoIndex>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

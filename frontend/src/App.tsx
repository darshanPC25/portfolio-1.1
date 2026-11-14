import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ContentProvider } from '@/contexts/ContentContext'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* /admin/login and /admin are added with the CMS in a later batch. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </QueryClientProvider>
  )
}

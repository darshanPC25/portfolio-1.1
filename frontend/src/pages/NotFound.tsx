import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Blob } from '@/components/UI/Blob'

/** Shown for any route that does not exist yet. */
export default function NotFound() {
  return (
    <main className="bg-hero relative flex min-h-svh items-center justify-center overflow-hidden px-5">
      <Blob tone="sage" className="top-[10%] left-[-4rem] size-56" />
      <Blob tone="olive" className="right-[-3rem] bottom-[12%] size-44" drift="normal" />
      <div className="relative text-center">
        <p className="font-serif text-lg text-muted italic">/ 404 /</p>
        <h1 className="mt-2 font-serif text-6xl text-ink italic sm:text-7xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-[36ch] text-lg text-muted">
          This page is not available. Head back to the portfolio.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-b from-moss to-forest px-6 font-medium text-ivory shadow-button transition-transform duration-300 ease-soft hover:-translate-y-0.5"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </main>
  )
}

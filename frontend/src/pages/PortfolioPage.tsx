import { Footer } from '@/components/Footer/Footer'
import { Navbar } from '@/components/Navbar/Navbar'
import { About } from '@/sections/About/About'
import { Contact } from '@/sections/Contact/Contact'
import { Education } from '@/sections/Education/Education'
import { GitHub } from '@/sections/GitHub/GitHub'
import { Hero } from '@/sections/Hero/Hero'
import { Journey } from '@/sections/Journey/Journey'
import { Projects } from '@/sections/Projects/Projects'
import { Skills } from '@/sections/Skills/Skills'

/**
 * The portfolio itself. Rendered by the public home page, the visual editor
 * canvas and the draft preview, always with the same components; only the
 * content source differs (published snapshot vs. draft).
 */
export function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Education />
        <GitHub />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

# Darshan Portfolio — Frontend

Public portfolio for Paridarshan Sahoo (Darshan). An independent React application;
it talks to the backend only over REST.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Three.js / React Three Fiber / Drei ·
GSAP · Framer Motion · React Router · TanStack Query · Axios · React Hook Form · Zod · Lucide

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run typecheck
```

Requires Node 20 or newer.

## Configuration

Copy `.env.example` to `.env` to change the backend address.

| Variable            | Default                 | Purpose              |
| ------------------- | ----------------------- | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Spring Boot backend  |

## Structure

```
src/
├── assets/        bundled static assets
├── components/    Navbar, Footer, Buttons, UI primitives
├── sections/      Hero, About, Skills, Projects, Journey, Education, GitHub, Contact
├── pages/         Home, NotFound
├── three/         WebGL hero scene (lazy-loaded)
├── hooks/         content, scroll, GitHub, hero intro
├── services/      API client, content, contact, GitHub
├── contexts/      ContentContext (content provider)
├── data/          defaultContent.ts — all site copy
├── types/         content model
├── utils/         class names, motion conventions, formatting
└── styles/        index.css — design tokens and base styles
public/images/     replaceable content images (profile, project previews)
```

## Content

Every word and image on the site comes from `src/data/defaultContent.ts`, typed by
`src/types/content.ts`, and reaches components through `usePortfolioContent()`.
When the backend serves published content, only `services/contentService.ts` changes.

Values that are not known yet are `null` and the UI adapts:

- `profile.resumeUrl` — the resume link is hidden until set
- `socialLinks[].url` — icons are hidden until set
- `github.username` — the section shows a short notice until set, then loads live data
- `projects.items[].repoUrl` / `demoUrl` — shown as "coming soon" chips until set

## Design system

Tokens live in the `@theme` block of `src/styles/index.css` and become Tailwind utilities.

- **Colour** — surfaces `ivory` `cream` `sand` `stone`; greens `mist` `sage` `fern` `olive`
  `moss` `forest` `pine`; text `ink` `muted`
- **Type** — Outfit (sans) for headings and body, Instrument Serif italic for the hero role,
  eyebrows and numerals
- **Spacing** — Tailwind 4px scale; sections use `py-20 / md:py-28 / lg:py-32` inside a
  `max-w-page` (76rem) column with `px-5 / sm:px-8` gutters
- **Breakpoints** — `xs` 416px, `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px
- **Radius** — `rounded-chip` 12px, `rounded-card` 28px, `rounded-panel` 40px, pills for buttons
- **Shadows** — `shadow-soft`, `shadow-lift`, `shadow-clay`, `shadow-button` (green-tinted)
- **Surfaces** — `.surface-clay` (cards), `.surface-glass` (frosted panels), `.blob-*` (CSS shapes)
- **Motion** — conventions in `src/utils/motion.ts`: one easing curve, reveal-once on scroll,
  80ms stagger, small hover lift; all disabled under `prefers-reduced-motion`

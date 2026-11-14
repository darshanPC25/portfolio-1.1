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
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Spring Boot REST API |

The site needs the backend running: all content comes from `GET /api/v1/portfolio`.
While it loads, a loading screen is shown; if the API cannot be reached, a
"could not be loaded" screen with a retry button.

## Structure

```
src/
├── assets/        bundled static assets
├── components/    Navbar, Footer, Buttons, UI primitives
├── sections/      Hero, About, Skills, Projects, Journey, Education, GitHub, Contact
├── pages/         Home, NotFound
├── three/         WebGL hero scene (lazy-loaded)
├── hooks/         content, scroll, GitHub, hero intro
├── services/      API client (single Axios instance), content, contact, GitHub
├── contexts/      ContentContext (loads published content from the API)
├── types/         content model (mirrors the API's published snapshot)
├── utils/         class names, motion conventions, formatting
└── styles/        index.css — design tokens and base styles
public/images/     replaceable content images (profile, project previews)
```

## Content

Every word and image on the site comes from the backend's published snapshot
(`services/contentService.ts`), typed by `src/types/content.ts`, and reaches components
through `usePortfolioContent()`. Publishing in the backend updates the site on the next
page load; no rebuild is needed.

- A section hidden in the CMS arrives as `null` and is not rendered.
- `appearance.heroSceneEnabled` switches the WebGL hero off; `appearance.motionEnabled`
  switches all animation off (same as the visitor preferring reduced motion).
- `seo` sets the page title, description, robots and Open Graph tags.

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
  word-by-word headline reveals, 80ms stagger, decorative scroll parallax, small hover lift
  or tilt; all disabled under `prefers-reduced-motion`

## Portfolio Studio (`/admin`)

The private CMS lives in `src/admin/` and is a separate lazy-loaded bundle, so visitors never
download it. `/admin/login` signs in; everything else under `/admin` requires a session.

```
src/admin/
├── AdminApp.tsx          session check, studio routes, expired-session redirect
├── api/                  adminClient (cookies + CSRF + retry), typed adminApi, query helpers
├── components/           layout and sidebar, Publish control, dialogs, toasts,
│   │                     CollectionManager (list CRUD + reorder + show/hide), SectionCard,
│   │                     SingletonForm, FileUpload
│   └── form/             declarative form engine: field definitions → inputs, zod
│                         validation, server field errors, unsaved-changes state
└── pages/                Login, Overview, Profile, Hero, About, Skills, Projects, Experience,
                          Education, Social Links, Resume, Appearance, SEO, Messages, Settings
```

Every edit is saved to the draft. **Publish** (top bar, with confirmation) makes the draft live;
the bar shows "Unpublished changes" until you do.

## 3D hero

`src/three/` holds the only WebGL canvas, lazy-loaded after first paint. Quality adapts to
the device (`src/hooks/useDeviceTier.ts`): desktops get finer geometry, soft shadows and
more particles; phones and modest laptops get a lighter scene. CSS shapes paint first and
remain as the fallback without WebGL, with Save-Data, or on very constrained hardware.

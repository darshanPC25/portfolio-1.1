# Till-Now Context — Darshan Portfolio + Visual CMS

Last updated: 2026-11-14 · Status: **Batch 1 approved. Waiting for Batch 2.**

This file summarises everything agreed and built so far, so work can resume in a new
session without the original conversation.

---

## 1. What the project is

A personal developer portfolio for **Paridarshan Sahoo ("Darshan")** with a private
visual CMS ("Portfolio Studio") where he can click any element of the real public site
and edit it.

| Fact         | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Name         | Paridarshan Sahoo (preferred: Darshan)                   |
| Title        | Software Developer \| Java Backend Developer             |
| Location     | India                                                    |
| Education    | B.Tech, Computer Science and Engineering (Data Science)  |
| Graduation   | 2026                                                     |
| Interests    | Java backend, Spring Boot, REST APIs, database management, software engineering, DSA, distributed systems |

Work is delivered in **batches** issued by Darshan. After each batch: report, stop,
wait for approval.

---

## 2. Standing rules from the master specification

These apply to every batch.

**Process**
- Do not start a batch until it is provided. Stop after each batch and wait.
- Each batch report covers: completed work, files created, files modified, dependencies
  added, tests performed, outstanding work, known issues, how to run.
- Inspect existing files before modifying. Preserve working code. Never duplicate
  implementations. Do not skip requirements silently.
- Real functionality only; no mock APIs as final implementations.

**Honesty of content**
- Never invent employment history, certifications, achievements, project or repository
  URLs, or professional experience.
- Never claim an unfinished project is finished.
- All profile content must be editable through the CMS.

**Architecture**
- Root layout: `frontend/`, `backend/`, `database/`, `docker-compose.yml`, `.gitignore`,
  `README.md`.
- Frontend and backend are fully independent apps (own dependencies, build, config).
  No React in `backend/`, no Java in `frontend/`. They communicate only over REST.
- Dev URLs: frontend `http://localhost:5173`, backend `http://localhost:8080`,
  PostgreSQL `localhost:5432`.

**Frontend stack**
React, TypeScript, Vite, Tailwind CSS, Three.js, React Three Fiber, Drei, GSAP,
Framer Motion, React Router, Axios, TanStack Query, React Hook Form, Zod, Lucide React.

**Backend stack (not started)**
Java 21, Spring Boot 3.x, Maven, Spring Web, Spring Security, Spring Data JPA,
Hibernate, PostgreSQL, JWT or secure sessions, BCrypt, Lombok, Jakarta Validation,
Flyway, Swagger/OpenAPI. Modular monolith.
- Base package is exactly **`com.darshanpc.portfolio`**; main class
  `com.darshanpc.portfolio.PortfolioApplication`. **Never** `com.darshan.portfolio`.
- Protect all admin APIs. No hardcoded admin credentials. No public registration.
  BCrypt-hashed passwords.

**Design**
- The uploaded reference image is the mandatory primary visual target: warm ivory and
  cream, sage / olive / forest green, elegant serif plus modern sans, large expressive
  headlines, organic floating 3D blobs and spheres, soft realistic shadows, rounded
  project cards, editorial layout, minimal navigation, generous spacing, subtle motion.
- No generic dark developer portfolio. No neon, purple or blue gradients.

**Public site sections**
Navigation, Hero, About, Technical Skills, Featured Projects, Professional Journey,
Education, GitHub Activity, Contact, Footer.

**Footer**
- Must display exactly: `© 2026 Paridarshan Sahoo. All rights reserved. · Login`
- "Login" links to `/admin/login`. The words "Admin Login" must never appear publicly.

**CMS (later batches)**
- Routes `/admin/login` and `/admin`, administrators only.
- Dashboard plus editing of profile, hero, about, skills, projects, experience,
  education, social links, resume, appearance, SEO, and contact messages.
- **Visual click-to-edit editor** that renders the *same React components* as the public
  site (no separate fake preview): hover outlines, edit indicators, inline editing,
  properties panel, save/cancel, unsaved indicators, preview, draft, publish with
  confirmation.
- Content persistence in PostgreSQL: draft and published versions, last-updated
  timestamps, display ordering, publish/unpublish, image and resume replacement.
  Visitors see only published content. Publishing must not need a rebuild or redeploy.

---

## 3. Environment (checked 2026-11-14)

| Tool       | State                                                     |
| ---------- | --------------------------------------------------------- |
| Java       | JDK 25 installed (spec targets Java 21)                   |
| Maven      | 3.9.14                                                    |
| Node       | v25.1.0                                                   |
| Docker     | installed                                                 |
| Git        | installed; the project folder is **not** a git repository |
| PostgreSQL | no local `psql`                                           |

Windows 11, project root `C:\Users\darshanPC\Desktop\Portfolio`.

---

## 4. Decisions made so far

| Topic | Decision | Status |
| ----- | -------- | ------ |
| Project root | `Desktop\Portfolio` itself is the root (no nested `darshan-portfolio/`) | In effect |
| Fonts | Outfit (sans) + Instrument Serif (serif), self-hosted via `@fontsource` | In effect |
| Tailwind | v4, tokens in a CSS `@theme` block (no `tailwind.config.js`) | In effect |
| Content source | One typed data file read through a context/hook; backend replaces it later | In effect |
| 3D | Single lazy-loaded WebGL canvas in the hero; CSS blobs everywhere else | In effect |
| Unknown values | Stored as `null`, never invented; UI hides or shows "coming soon" | In effect |
| Java version | Compile for Java 21 using the installed JDK 25 | **Proposed, not confirmed** |
| PostgreSQL | Run via `docker-compose.yml` | **Proposed, not confirmed** |
| Authentication | Short-lived JWT in an httpOnly cookie plus refresh token | **Proposed, not confirmed** |
| First admin account | Created from environment variables on first startup | **Proposed, not confirmed** |

---

## 5. Batch 1 — Design system and public portfolio (approved)

### Built
- Design system: palette, typography, spacing, breakpoints, radii, shadows, card and
  button styles, motion conventions.
- All ten public sections, fully responsive.
- Hero with the three required lines, portrait placeholder, floating 3D blobs, Contact
  and Explore Projects CTAs, availability indicator.
- Projects: one featured layout plus a card grid; image, name, description, tags,
  status, repo and demo link slots, and a "View details" dialog.
- Footer with the exact copyright line and Login link.
- `/admin/login` currently shows a "Page not found" screen (login page not built yet,
  as instructed).

### Frontend structure

```
frontend/
├── package.json, vite.config.ts, tsconfig.json, index.html
├── .env.example, .gitignore, README.md
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── profile-placeholder.svg
│       └── projects/   document-management, transport-eta, ratha-yatra, reddit-sentiment (.svg)
└── src/
    ├── main.tsx, App.tsx, vite-env.d.ts
    ├── assets/
    ├── components/
    │   ├── Navbar/   Navbar.tsx
    │   ├── Footer/   Footer.tsx
    │   ├── Buttons/  Button.tsx
    │   └── UI/       Section, SectionHeading, Card, Tag, Blob, Reveal, Modal,
    │                 AvailabilityBadge, SocialLinks, BrandIcons
    ├── sections/
    │   ├── Hero/       Hero, HeroBackdrop
    │   ├── About/      About
    │   ├── Skills/     Skills
    │   ├── Projects/   Projects, ProjectCard, ProjectDetails, ProjectLinks,
    │   │               ProjectPreview, projectStatus
    │   ├── Journey/    Journey, WavePanel
    │   ├── Education/  Education
    │   ├── GitHub/     GitHub
    │   └── Contact/    Contact, ContactForm
    ├── pages/      Home.tsx, NotFound.tsx
    ├── three/      HeroScene, OrganicBlob, SceneBoundary, webgl
    ├── hooks/      usePortfolioContent, useGitHubActivity, useActiveSection,
    │               useScrolled, useInViewport, useHeroIntro
    ├── services/   apiClient, contentService, contactService, githubService
    ├── contexts/   ContentContext.tsx
    ├── data/       defaultContent.ts
    ├── types/      content.ts
    ├── utils/      cn, motion, format
    └── styles/     index.css
```

Also at the root: `README.md`, `.gitignore`, `.claude/launch.json` (preview config).

### How content flows
- `src/types/content.ts` defines the content model (`PortfolioContent`).
- `src/data/defaultContent.ts` holds every word and image path.
- `services/contentService.ts` → `contexts/ContentContext.tsx` (TanStack Query) →
  `hooks/usePortfolioContent()` → sections.
- When the backend exists, only `contentService.fetchPortfolioContent()` changes.

### Endpoints the frontend already expects
| Purpose | Call |
| ------- | ---- |
| Contact form | `POST {VITE_API_BASE_URL}/api/public/contact-messages` with `{ name, email, subject, message }` |
| GitHub activity | Public GitHub API, directly from the browser, once a username is set |

`VITE_API_BASE_URL` defaults to `http://localhost:8080`.

### Design tokens (in `src/styles/index.css`)
- Surfaces: `ivory #f8f5ec`, `cream #f1ebdb`, `sand #e4dbc5`, `stone #cfc5ab`
- Greens: `mist #e3ead4`, `sage #bccaa2`, `fern #9db07f`, `olive #6f8446`,
  `moss #566b35`, `forest #3a4f25`, `pine #26361a`
- Text: `ink #222a1b`, `muted #5a6350`
- Radius: `rounded-chip` 12px, `rounded-card` 28px, `rounded-panel` 40px
- Shadows: `shadow-soft`, `shadow-lift`, `shadow-clay`, `shadow-button`
- Surfaces: `.surface-clay`, `.surface-glass`, `.blob-sage|olive|cream`
- Breakpoints: `xs` 416px, `sm` 640, `md` 768, `lg` 1024, `xl` 1280
- Motion rules: `src/utils/motion.ts`; everything is disabled under
  `prefers-reduced-motion`

### Dependencies installed
- Runtime: react 19, react-dom, react-router-dom 7, three, @react-three/fiber,
  @react-three/drei, gsap, framer-motion, axios, @tanstack/react-query,
  react-hook-form, zod 4, @hookform/resolvers, lucide-react,
  @fontsource-variable/outfit, @fontsource/instrument-serif
- Dev: vite 8, @vitejs/plugin-react, typescript 7, tailwindcss 4, @tailwindcss/vite,
  @types/react, @types/react-dom, @types/three, @types/node

### Tests performed
- Type-check and production build pass.
- No horizontal overflow at 375, 768 and 1024 px.
- Mobile menu opens, lists all links, closes on selection.
- Project dialog: focus moves in, Escape and close button work, focus returns.
- Contact form: required-field and email validation work; a valid submit shows the
  "could not be sent" message (no backend yet) and keeps the typed text.
- Footer text matches exactly; Login goes to `/admin/login`; "Admin Login" appears
  nowhere.
- Not tested: other browsers, screen readers, the live GitHub view.

### How to run

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into frontend/dist
```

---

## 6. Placeholders and assumptions awaiting Darshan's input

| Item | Current state | Needed |
| ---- | ------------- | ------ |
| Profile photo | Illustrated silhouette | Real photo file |
| Resume | `null`; download link hidden | Resume file |
| GitHub username | `null`; section shows "will be linked here soon" | Username |
| Social links | All `null`; icons hidden | GitHub, LinkedIn, email URLs |
| Public contact email | `null` | Decide whether to show one |
| Institution name | `null`; not shown | College / university name |
| Project status | All four labelled "In development" (assumption) | Real status of each |
| Project tags | Topic tags derived from the titles (assumption) | Real technologies |
| Project images | Illustrative mock-ups | Real screenshots |
| Repo / demo URLs | `null`; shown as "coming soon" | Real URLs when available |
| Skills | SQL and PostgreSQL were added beyond the interest list | Keep or remove |
| Professional Journey | Two non-employment rows ("Now", "Next") | Real roles when they exist |
| About copy and "How I work" steps | Written from the stated facts | Review wording |

---

## 7. Known issues

- The contact form cannot deliver messages until the backend endpoint exists.
- Main script is about 206 kB gzipped; the 3D scene is a separate 245 kB chunk loaded
  after first paint.
- three.js logs a harmless `THREE.Clock` deprecation warning in the console.

---

## 8. Not started

- `backend/` (Spring Boot), `database/`, `docker-compose.yml`
- Authentication and the `/admin/login` page
- Portfolio Studio dashboard and all editing screens
- Visual click-to-edit editor, draft/publish workflow
- File uploads (photo, project images, resume)
- Serving published content from PostgreSQL to the public site
- SEO and appearance settings

**Next step:** Darshan sends Batch 2.

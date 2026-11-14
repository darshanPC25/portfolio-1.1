# Till-Now Context — Darshan Portfolio + Visual CMS

Last updated: 2026-11-14 · Status: **Batches 1 and 2 approved (commits "Batch1 Completed", "Batch2 Completed"). Batches 3 and 4 approved (not yet committed). Waiting for Batch 5.**

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
| Docker     | Docker Desktop 28.5 (start it before running the backend) |
| Git        | the project is a git repository (Darshan commits each batch) |
| PostgreSQL | a local **PostgreSQL 18 Windows service occupies port 5432**, so the Docker database runs on **5433** here (`POSTGRES_PORT=5433` in root `.env`) |

Windows 11, project root `C:\Users\darshanPC\Desktop\Portfolio`.

---

## 4. Decisions made so far

| Topic | Decision | Status |
| ----- | -------- | ------ |
| Project root | `Desktop\Portfolio` itself is the root (no nested `darshan-portfolio/`) | In effect |
| Fonts | Outfit (sans) + Instrument Serif (serif), self-hosted via `@fontsource` | In effect |
| Tailwind | v4, tokens in a CSS `@theme` block (no `tailwind.config.js`) | In effect |
| Content source | Frontend loads everything from `GET /api/v1/portfolio` (bundled data file removed in Batch 3) | In effect |
| 3D | Single lazy-loaded WebGL canvas in the hero; CSS blobs everywhere else | In effect |
| Unknown values | Stored as `null`, never invented; UI hides or shows "coming soon" | In effect |
| Java version | Compile for Java 21 (`--release 21`) with the installed JDK 25 | In effect since Batch 3 |
| PostgreSQL | PostgreSQL 17 via `docker-compose.yml`; host port configurable | In effect since Batch 3 |
| Spring Boot | 3.5.16 (latest 3.x); springdoc 2.10.0 | In effect |
| Draft vs published | Content tables = draft; publishing stores an immutable JSON snapshot in `portfolio_publication`; public API serves only the latest snapshot | In effect |
| Authentication | **Server-side sessions** (Spring Security), HttpOnly SameSite=Strict cookie + CSRF token. Chosen over the earlier JWT proposal because logout and lockout take effect immediately | In effect since Batch 4 |
| First admin account | `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_DISPLAY_NAME`, used once while no admin exists | In effect since Batch 4 |
| Uploads | Stored on disk (`UPLOAD_DIRECTORY`), type checked by content; public only once published | In effect since Batch 4 |

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
- *(Updated in Batch 3)* `services/contentService.ts` fetches `GET /api/v1/portfolio` →
  `contexts/ContentContext.tsx` (TanStack Query, loading and error screens) →
  `hooks/usePortfolioContent()` → sections. `src/data/defaultContent.ts` was removed.

### Endpoints the frontend already expects
| Purpose | Call |
| ------- | ---- |
| Contact form | *(Batch 3)* `POST {VITE_API_BASE_URL}/contact` with `{ name, email, subject, message, website }` |
| GitHub activity | Public GitHub API, directly from the browser, once a username is set |

`VITE_API_BASE_URL` defaults to `http://localhost:8080/api/v1` (Batch 3).

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

## 5b. Batch 2 — 3D experience and interactions (approved)

No sections were redesigned or removed. No dependencies were added.

### Hero 3D scene (`src/three/`)
- `HeroScene.tsx` — canvas, per-tier quality settings, pointer tracking, scroll-linked
  camera drift and group tilt, `PerformanceMonitor` drops pixel ratio on slow devices.
- `OrganicBlob.tsx` — morphing clay forms (`MeshDistortMaterial` with sheen): grow-in
  entrance, slow self-rotation, bobbing, pointer parallax by depth.
- `Pebbles.tsx` — all solid spheres and tiny particles in **one instanced mesh**
  (single draw call).
- `SceneLighting.tsx` — key light, a near-frontal shadow-only light, soft VSM shadows
  onto an invisible backdrop plane, and an environment built from local Lightformers
  (no network HDR file).
- `layout.ts` — wide and narrow (portrait) compositions; seeded particles that avoid
  the text and portrait areas. `palette.ts` — scene colours and helpers.

### Device-aware rendering (`src/hooks/useDeviceTier.ts`)
| | high tier (desktop, fine pointer, > 4 cores, > 4 GB) | low tier (phones, tablets, modest laptops) |
| --- | --- | --- |
| Form geometry | 64 segments | 40 segments |
| Particles | 18 | 7 |
| Soft shadows | on | off |
| Max pixel ratio | 1.75 | 1.25 |
| Antialias | on | off |

- Static CSS shapes paint first and cross-fade out when the canvas is ready.
- CSS shapes stay as the fallback with no WebGL, Save-Data, ≤ 2 GB memory or ≤ 2 cores,
  or if the 3D chunk fails.
- The render loop stops when the hero is off screen; under reduced motion the scene
  renders one still frame.

### Animation
- **Hero entrance (GSAP):** headline words rise from masks, portrait unveils from the
  bottom while the photo settles from a zoom, then supporting content fades up.
- **Hero scroll-out (GSAP ScrollTrigger):** content lifts, headline softens, portrait
  lags slightly for depth.
- **Text reveal:** every section heading and the Contact heading reveal word by word
  (`components/UI/TextReveal.tsx`).
- **Scroll parallax:** every decorative CSS blob drifts on scroll (`Blob` `parallax` prop).
- **Section transition:** the Journey panel grows into place on scroll
  (`components/UI/ScrollScale.tsx`) and its wave layers slide at different speeds.
- **Project hover:** 3D tilt toward the mouse plus a light sheen and image zoom
  (`components/UI/TiltCard.tsx`); touch input is ignored.
- **Image transitions:** images fade in from a soft blur (`components/UI/FadeImage.tsx`);
  project screens open from an inset clip when scrolled into view.
- **Navigation:** shared active pill glides between links, bar hides on scroll down and
  returns on scroll up (stays while focused or menu open), reading-progress line,
  slide-in on load, staggered mobile menu, animated menu icon.
- All of it is disabled under `prefers-reduced-motion`.

### Batch 2 tests
- Type-check and production build pass.
- Desktop (1024 px, high tier): 3D forms, pebbles, particles and soft shadows render;
  intro plays; headline fades and nav hides/returns on scroll; active pill tracks
  sections; card tilt, sheen and image zoom apply only to the hovered card; Journey
  panel scales and wave layers move.
- Mobile (375 px, low tier detected): narrow layout, no horizontal overflow, mobile menu
  opens with staggered items (checked through the DOM).
- No console errors.
- Not tested: an actual reduced-motion setting (the pane cannot emulate it), real
  phones, browsers other than the built-in one.

---

## 5c. Batch 3 — Spring Boot backend (approved)

### Backend (`backend/`, package `com.darshanpc.portfolio`)
- Java 21 · Spring Boot 3.5.16 · Web · Data JPA/Hibernate 6.6 · PostgreSQL · Flyway 11 ·
  Validation · Lombok · springdoc 2.10 (Swagger UI in dev only) · Actuator (health only).
- Packages: `config/`, `controller/`, `service/` (+`publication/`), `repository/`,
  `entity/` (+`enums/`), `dto/` (`portfolio/`, `contact/`), `mapper/`, `security/`
  (+`ratelimit/`), `admin/` (placeholder), `exception/`, `validation/`, `util/`.
- Entities: PortfolioProfile, HeroContent, AboutContent (+AboutFact, ApproachStep),
  PortfolioSection (headings, nav labels, visibility, per-section settings), SkillCategory,
  Skill, Project, Experience, Education, SocialLink, PortfolioAppearance, SeoSettings,
  ContactMessage, AdminUser, PortfolioAsset, PortfolioPublication.
- Flyway: `V1__create_schema.sql` (tables, checks, indexes, single-row constraints),
  `V2__seed_initial_content.sql` (Batch 1 copy; unknowns stay NULL; no admin users).
- Hibernate `ddl-auto: validate`; JPA auditing fills `created_at`/`updated_at`;
  `@Version` optimistic locking.

### Publishing model
- Content tables are the **draft**. `PublicationService.publish()` builds the public
  snapshot (`PortfolioResponse`) and stores it as the next version.
- Public endpoints read only the latest snapshot (cached in memory, refreshed when a
  newer version number exists). Hidden sections → `null`; hidden items and social links
  without URLs are excluded.
- `InitialPublicationRunner` publishes the seed once on a fresh database.
- There is no publish endpoint yet; it comes with the admin API.

### API (`/api/v1`)
`GET /portfolio`, `/profile`, `/projects`, `/projects/{id}` (id or slug), `/skills`,
`/experience`, `/education`, `/social-links`; `POST /contact`.
Errors are RFC 9457 problem JSON; validation errors include an `errors` field map.

### Contact
- Validation mirrors the frontend; `@SingleLine` blocks line breaks in name/subject.
- Fixed-window rate limit per client IP (default 5 per 10 min) → 429 + `Retry-After`.
- Hidden honeypot field `website`: filled → 202 but not stored.
- Stored with status NEW, salted SHA-256 IP hash (raw IP never stored), user agent.

### Configuration
- Root `.env` (Docker Compose): `POSTGRES_DB/USER/PASSWORD/PORT`.
- `backend/.env` (read via `spring.config.import`): `DB_URL/USERNAME/PASSWORD`,
  `CORS_ALLOWED_ORIGINS`, contact rate limit, `CONTACT_IP_HASH_SALT`.
- Both gitignored; the local ones were generated with a random password during Batch 3.

### Frontend changes
- Single Axios client (`services/apiClient.ts`) with problem-body helper and media URL
  resolver; `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
- Content loaded from the API; branded loading and "could not be loaded / Try again" screens.
- Sections hidden in the CMS are not rendered.
- Appearance: `heroSceneEnabled` and `motionEnabled` wired in (`hooks/useMotionDisabled.ts`
  replaces direct `useReducedMotion` calls; `data-reduce-motion` on `<html>` for CSS).
- SEO settings applied to title/meta/canonical (`components/UI/SeoHead.tsx`).
- Contact form: honeypot field, server field errors shown inline, rate-limit message.

### Batch 3 tests
- `./mvnw test`: 16 tests pass (7 public API, 5 contact, 4 rate limiter) against
  PostgreSQL 17 in Testcontainers. Covers seeded content, id/slug lookup, 404 problem,
  drafts private until published, unpublished project removed, API docs off outside dev,
  contact persistence + IP hashing, field errors, malformed JSON, honeypot, 429.
- Manual: backend run with `./mvnw spring-boot:run` against Docker Postgres; all
  endpoints checked with curl; CORS allows only `http://localhost:5173`; Swagger UI works.
- Browser: site renders entirely from the API; contact form posts and the row appears in
  PostgreSQL; backend stopped → error screen; restarted → "Try again" recovers; restart
  did not re-publish.
- Frontend type-check and production build pass.

---

## 5d. Batch 4 — Portfolio Studio and authentication (approved)

### Backend
- **Spring Security** (`security/SecurityConfig`): `/api/v1/admin/**` requires ROLE_ADMIN except
  `GET auth/csrf` and `POST auth/login`; everything public stays open. JSON 401/403 problems.
  CORS with credentials for the frontend origin; `frame-ancestors` allows the studio to preview PDFs.
- **Sessions:** cookie `PORTFOLIO_SESSION` (HttpOnly, SameSite=Strict, Secure configurable),
  2 h idle timeout, new session id on sign-in, logout invalidates the session.
- **CSRF:** session-bound token from `GET /admin/auth/csrf` (also returned by login), sent as
  `X-CSRF-TOKEN`. Contact form is exempt (sessionless, rate limited).
- **Login** (`admin/auth`): BCrypt cost 12; 10 attempts/IP/15 min → 429; 5 wrong passwords →
  15 min lock; identical "Invalid email or password." for every failure; dummy hash for
  unknown emails. Password policy 12–64 chars (≤ 72 bytes).
- **Provisioning:** `AdminBootstrapRunner` creates the first admin from env vars only while the
  table is empty; warns to remove `ADMIN_PASSWORD` afterwards. No registration endpoint.
- **Account:** change display name/email and password (both require the current password).
- **Studio APIs** (`admin/…`): profile + photo, resume, hero, about, sections (copy, visibility,
  order), skills + categories, projects (CRUD, reorder, publish/unpublish, image), experience,
  education, social links (CRUD + reorder), appearance, SEO + sharing image, messages
  (filter, read/unread/archive, delete), overview counts, publish + history.
- **Uploads** (`service/asset/AssetStorageService`): PNG/JPEG/WebP ≤ 5 MB, PDF ≤ 10 MB, sniffed
  from bytes (SVG refused), random file names, SHA-256, image dimensions.
  `GET /api/v1/assets/{id}` serves a file publicly only if the latest publication uses it.
- **Unpublished-changes tracking:** `draft_state.last_modified_at` touched by every studio write
  (including deletes); overview compares it with the latest publication.
- **Migration V3:** appearance `accent_color`, `background_style` (IVORY/CREAM/MIST),
  `heading_font` (SANS/SERIF); `draft_state` table. Snapshot schema version → 2.
- Validation: `@WebUrl` (http/https only), `@LinkTarget` (#anchor, /path, http(s), mailto) —
  blocks `javascript:` links; slugs unique (409); skill names unique per category (409).

### Frontend (`src/admin/`, lazy-loaded separate bundle)
- `/admin/login`: email + password, show/hide, zod validation, loading, error messages
  (invalid, too many attempts, server unreachable), session-expired and signed-out notices,
  redirect back to the requested page, already-signed-in redirect. No registration.
- `/admin`: responsive layout, sidebar with the 14 menu items (drawer on mobile), unread badge,
  top bar with "Unpublished changes" status, **Publish** (confirmation + optional note),
  View site, Sign out.
- Pages: Overview (live counts + publication history), Profile (+photo), Hero, About,
  Skills, Projects (+image), Experience, Education, Social Links, Resume (upload, replace,
  preview, download, remove), Appearance (accent colour, background, heading font, 3D and
  motion switches, section order), SEO (+sharing image), Messages, Settings.
- Shared engine: declarative fields → inputs + zod validation + server field errors +
  "Unsaved changes" + Discard/Save; CollectionManager for list CRUD with reorder and show/hide;
  confirmation before every delete and before publishing.
- Public site now applies Appearance (accent → `--color-olive`, background → `--color-ivory`,
  heading font → `--font-heading`) and downloads the resume as an attachment.

### Batch 4 tests
- `./mvnw test`: **41 pass** (11 auth, 14 studio content, 7 public API, 5 contact, 4 rate limiter)
  against PostgreSQL 17 (Testcontainers). Auth: provisioning + hash, 401 without session,
  CSRF required, generic failures, validation, lockout, IP rate limit, logout invalidation,
  password and account changes. Content: every create/read/update/delete/reorder/visibility
  call, uploads (PNG ok; SVG and disguised files 415; PDF ok), asset visibility before/after
  publish, overview counts, publish flow.
- Browser (real backend + Docker DB): footer Login → login page; validation; wrong password;
  show/hide; sign-in; all 14 pages load without errors; projects add/edit/show/move/delete;
  skills category + skill add/duplicate/reorder/move/delete; experience (server date error
  shown in form), education, social links (mailto normalisation, bad URL rejected); resume
  upload/preview/download/remove; SEO image upload/remove; hero + appearance edit → publish →
  public site updated without rebuild → restored and republished (live = v4, original content);
  messages read/archive/filter/delete; settings password errors; sign-out kills the session;
  protected route redirect; mobile login and studio (drawer, no overflow).
- Frontend type-check and production build pass.

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
| Studio sign-in | Local test admin `admin@darshan.local`, random password in gitignored `backend/.env` | Change email + password in Studio → Settings, then remove `ADMIN_PASSWORD` from `backend/.env` |

---

## 7. Known issues

- No email notification for new contact messages (inbox only).
- Replaced uploads are kept on disk (an older publication may still use them); there is no
  clean-up of unused files yet.
- Changing the password does not sign out other active sessions.
- Deleting an item leaves a gap in display order numbers (order is still correct).
- Sessions live in server memory: restarting the backend signs the admin out.
- The studio has no "restore placeholder" for the profile photo; replace it with a real photo.
- Rate limiting is in memory: per instance, reset on restart.
- Snapshots store the response JSON; a future change to its shape needs a re-publish
  (tracked by `schema_version`).
- Main script is about 226 kB gzipped after Batch 4 (studio is a separate ~20 kB + shared chunks) (206 kB after Batch 1; ScrollTrigger and the new
  motion components added ~24 kB). The 3D scene is a separate 267 kB chunk loaded after
  first paint; the contact form is a separate 38 kB chunk.
- three.js logs a harmless `THREE.Clock` deprecation warning in the console.

---

## 8. Not started

- Visual click-to-edit editor (next batch per the spec)

**Next step:** Darshan sends Batch 5.

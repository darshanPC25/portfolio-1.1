# Darshan Portfolio

Personal developer portfolio and private visual CMS for Paridarshan Sahoo (Darshan).

| Part     | Directory   | Status                                      | URL                   |
| -------- | ----------- | ------------------------------------------- | --------------------- |
| Frontend | `frontend/` | Public site + Portfolio Studio (`/admin`)   | http://localhost:5173 |
| Backend  | `backend/`  | REST API, auth, studio APIs, publishing     | http://localhost:8080 |
| Database | `database/` | PostgreSQL via Docker, Flyway migrations    | localhost:5432        |

The frontend and backend are independent applications that communicate over REST.

## Run everything locally

Prerequisites: Docker, Java 21+, Node 20+.

```bash
# 1. Database (project root)
cp .env.example .env              # set POSTGRES_PASSWORD; set POSTGRES_PORT if 5432 is taken
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env              # same credentials and port as above, plus ADMIN_EMAIL / ADMIN_PASSWORD
./mvnw spring-boot:run            # Windows: mvnw.cmd spring-boot:run

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Portfolio Studio is at http://localhost:5173/admin (the small
**Login** link in the footer); sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set, then
remove `ADMIN_PASSWORD` from `backend/.env`. Details: [backend/README.md](backend/README.md),
[frontend/README.md](frontend/README.md), [database/README.md](database/README.md).

## Tests

```bash
cd backend && ./mvnw test        # 105 tests, needs Docker (Testcontainers PostgreSQL 17)
cd frontend && npm test          # 28 unit tests (Vitest)
cd frontend && npm run build     # type-check + production build
```

Latest results (Batch 6, 14 Nov 2026): backend 105/105 pass, frontend 28/28 pass, build passes.
Lighthouse against the production Docker stack: Accessibility 100, Best Practices 100,
SEO 100 (mobile and desktop); Performance 81–90 desktop, 50–54 mobile (simulated slow phone).

## Deployment

**Vercel + AWS Lambda + Neon** (the planned production setup): step-by-step in
[DEPLOY-VERCEL-LAMBDA-NEON.md](DEPLOY-VERCEL-LAMBDA-NEON.md).

**Single server with Docker** (alternative):

`docker-compose.prod.yml` runs PostgreSQL, the backend and nginx (site + `/api` proxy) from
`backend/Dockerfile` and `frontend/Dockerfile`. Step-by-step instructions, environment
variables, migrations and backups: [DEPLOYMENT.md](DEPLOYMENT.md).

## Known limitations

- Mobile Lighthouse performance is about 50: the 3D hero (three.js, ~270 kB gzipped) and the
  animation libraries cost main-thread time on slow phones. The scene now loads only after the
  page is idle; static shapes show until then.
- Studio sessions live in server memory: restarting the backend signs the admin out, and the
  backend runs as a single instance (rate limits are per instance too).
- Uploaded images are served as uploaded (no resizing or WebP conversion); replaced files stay on
  disk.
- Link previews on social sites use the static tags in `index.html`, not the SEO settings from the
  Studio (crawlers do not run JavaScript).
- The GitHub contribution graph (including private contributions, as counts) needs `GITHUB_TOKEN` on the backend; without it the section shows
  your commits counted from your 8 most recently pushed public repositories.
- One shared draft for all editors.
- Dark mode is a per-visitor choice (default light); it is not configurable from the Studio, and
  the Appearance background/text colours apply to the light theme only.

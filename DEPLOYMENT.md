# Deployment

The portfolio is three independent pieces:

| Piece    | Build                                  | Runs as                                 |
| -------- | -------------------------------------- | --------------------------------------- |
| Frontend | `frontend/` → `npm run build` → `dist/` | static files (nginx in the Docker image) |
| Backend  | `backend/` → `./mvnw package` → jar     | Java 21 process (`SPRING_PROFILES_ACTIVE=prod`) |
| Database | Flyway migrations in the backend jar    | PostgreSQL 17                           |

Publishing content in Portfolio Studio writes a new snapshot to PostgreSQL. The public site
reads it on the next page load, so **content changes never need a rebuild or redeploy**.

---

## Option A — Docker Compose on one server (recommended)

`docker-compose.prod.yml` runs PostgreSQL, the backend and an nginx container that serves the
site and forwards `/api/` to the backend. Browser and API share one origin, so the session
cookie stays first-party (`SameSite=Strict`) and no CORS preflights are needed.

```text
visitor ──HTTPS──▶ your TLS proxy ──HTTP──▶ web (nginx :80) ──/api/──▶ backend :8080 ──▶ postgres :5432
                                              └─ static site
```

### 1. Prerequisites
- A Linux server with Docker Engine and the Compose plugin.
- A domain pointing at the server and a TLS-terminating proxy in front of the `web`
  container (Caddy, a host nginx, Traefik, or your platform's load balancer). It must send
  `X-Forwarded-Proto: https` and `X-Forwarded-For`.

### 2. Configure

```bash
cp .env.production.example .env.production     # gitignored
```

Fill in every value:

| Variable | Meaning |
| -------- | ------- |
| `SITE_URL` | Public address, e.g. `https://darshan.dev` (CORS, sitemap, robots.txt) |
| `WEB_PORT` | Host port of the web container that your TLS proxy forwards to |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database; use a long random password (`openssl rand -base64 32`) |
| `CONTACT_IP_HASH_SALT` | Long random string; hashes contact-form IP addresses |
| `SESSION_COOKIE_SECURE` | `true` in production (cookie only over HTTPS) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME` | First administrator, created once on first start |
| `GITHUB_TOKEN` | Optional. A GitHub token with no scopes enables the full-year contribution graph |

### 3. Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production ps     # all healthy
```

On first start the backend applies all Flyway migrations, seeds the initial content, publishes
it once, and creates the administrator.

### 4. After the first start
1. Sign in at `https://your-domain/admin/login` (the footer **Login** link).
2. Change the password in Studio → Settings if you like.
3. **Remove `ADMIN_PASSWORD`** from `.env.production`, then
   `docker compose -f docker-compose.prod.yml --env-file .env.production up -d`.

### TLS proxy example (Caddy)

```caddyfile
your-domain.example {
    reverse_proxy 127.0.0.1:8088
}
```

Caddy obtains certificates automatically and sets the forwarding headers.

---

## Option B — separate hosting

- **Frontend** on any static host (Netlify, Vercel, S3 + CloudFront, nginx):
  `VITE_API_BASE_URL=https://api.your-domain.example/api/v1 VITE_SITE_URL=https://your-domain.example npm run build`
  and upload `frontend/dist/`. Configure the host to serve `index.html` for unknown paths
  (single-page app) and to cache `/assets/*` for a year.
- **Backend** anywhere that runs a Java 21 jar or the backend image, with
  `SPRING_PROFILES_ACTIVE=prod` and the variables below.
- Keep the API on a **sub-domain of the same site** (`api.your-domain.example`). The session
  cookie is `SameSite=Strict`; a completely different domain would be cross-site and the
  studio could not sign in.

### Backend environment variables (`prod` profile)

| Variable | Required | Default | Notes |
| -------- | -------- | ------- | ----- |
| `SPRING_PROFILES_ACTIVE` | yes | — | `prod` |
| `DB_URL` | yes | — | `jdbc:postgresql://host:5432/portfolio` |
| `DB_USERNAME`, `DB_PASSWORD` | yes | — | |
| `CORS_ALLOWED_ORIGINS` | yes | — | Public site origin(s), comma separated |
| `CONTACT_IP_HASH_SALT` | recommended | random per start | |
| `SESSION_COOKIE_SECURE` | | `true` | |
| `ADMIN_SESSION_TIMEOUT` | | `2h` | Idle timeout of studio sessions |
| `UPLOAD_DIRECTORY` | | `/var/lib/portfolio/uploads` | Must be persistent storage |
| `FORWARD_HEADERS_STRATEGY` | | `framework` | Use `none` if nothing proxies the backend |
| `DB_POOL_MAX_SIZE`, `DB_POOL_MIN_IDLE` | | `10`, `2` | HikariCP pool |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME` | first start only | | |
| `CONTACT_RATE_LIMIT_MAX`, `CONTACT_RATE_LIMIT_WINDOW` | | `5`, `10m` | |
| `GITHUB_TOKEN` | optional | — | Any GitHub token with no scopes: full-year contribution graph and a higher rate limit |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | optional | —, `587` | SMTP mailbox for contact form emails (turn them on in Studio → Messages) |
| `MAIL_FROM`, `MAIL_SSL` | | `MAIL_USERNAME`, `false` | Sender address; `MAIL_SSL=true` for port 465 |
| `GITHUB_CACHE_TTL` | | `30m` | How long GitHub activity is cached |

The `prod` profile turns Swagger UI and API docs off, logs at INFO and exposes only
`/actuator/health` (no details).

---

## Database migrations

Flyway runs automatically when the backend starts; the schema is versioned in
`backend/src/main/resources/db/migration` (`V1` … `V7`). Hibernate only validates the schema
(`ddl-auto: validate`) and never changes it.

- **Upgrading:** deploy the new backend; pending migrations run before the app accepts
  traffic. If a migration fails the app stops and the database is left at the last good
  version.
- **Adding a migration:** create `V6__short_description.sql`. Never edit a migration that has
  already run anywhere — Flyway checks checksums and will refuse to start.
- **Check status:** `SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;`

## Backups

Everything the site needs is in two places:

```bash
# Database
docker compose -f docker-compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > portfolio-$(date +%F).dump

# Uploaded files (photo, resume, screenshots)
docker run --rm -v portfolio-prod_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tgz -C /data .
```

Restore with `pg_restore --clean -d portfolio` and by extracting the archive into the volume.

## Security checklist

- [ ] HTTPS everywhere; `SESSION_COOKIE_SECURE=true`.
- [ ] `.env.production` readable only by the deploying user; never committed.
- [ ] `ADMIN_PASSWORD` removed after the first start.
- [ ] Only the web container's port is published; PostgreSQL and the backend are internal.
- [ ] Backups scheduled and a restore tried once.

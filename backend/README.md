# Darshan Portfolio — Backend

Spring Boot REST API and content store for the portfolio. An independent application:
its own `pom.xml`, Maven wrapper, configuration and build.

## Stack

Java 21 · Spring Boot 3.5 · Spring Web · Spring Data JPA / Hibernate · PostgreSQL ·
Spring Security (sessions, CSRF, BCrypt) · Flyway · Jakarta Validation · Lombok ·
springdoc OpenAPI · Testcontainers

## Run locally

1. **Start PostgreSQL** (from the project root):

   ```bash
   cp .env.example .env          # then set POSTGRES_PASSWORD (and POSTGRES_PORT if 5432 is taken)
   docker compose up -d
   ```

2. **Configure the backend**:

   ```bash
   cd backend
   cp .env.example .env          # same username/password/port as the root .env
   ```

3. **Run**:

   ```bash
   ./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
   ```

The API listens on http://localhost:8080. On a fresh database Flyway creates the schema,
seeds the initial content, and the seed is published once.

- Swagger UI (dev profile only): http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

## Tests

```bash
./mvnw test
```

Integration tests start a throwaway PostgreSQL 17 container, so Docker must be running.

## Configuration

`application.yml` holds shared settings, `application-dev.yml` the local ones (the default
profile). Secrets are never in source: they come from environment variables or the
gitignored `backend/.env`, which Spring Boot reads automatically.

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection |
| `SERVER_PORT` | HTTP port (default 8080) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `CONTACT_RATE_LIMIT_MAX`, `CONTACT_RATE_LIMIT_WINDOW` | Contact messages allowed per IP per window (default 5 per 10m) |
| `CONTACT_IP_HASH_SALT` | Secret used to hash sender IPs before storing them |
| `FORWARD_HEADERS_STRATEGY` | Set to `framework` behind a trusted reverse proxy |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME` | First administrator (used once, while none exists) |
| `SESSION_COOKIE_SECURE`, `ADMIN_SESSION_TIMEOUT` | Session cookie over HTTPS only; idle timeout (default 2h) |
| `ADMIN_LOGIN_RATE_LIMIT_MAX`, `ADMIN_LOGIN_RATE_LIMIT_WINDOW` | Sign-in attempts per IP per window (default 10 per 15m) |
| `UPLOAD_DIRECTORY` | Where uploaded files are stored (default `./data/uploads`) |

## Portfolio Studio (admin) access

- **Sign-in:** `POST /api/v1/admin/auth/login` creates a server-side session (cookie
  `PORTFOLIO_SESSION`: HttpOnly, SameSite=Strict, `Secure` when `SESSION_COOKIE_SECURE=true`).
  Logout destroys the session immediately. Sessions expire after 2 hours idle.
- **CSRF:** every state-changing studio request sends `X-CSRF-TOKEN`, obtained from
  `GET /api/v1/admin/auth/csrf` (and returned by login).
- **Passwords:** BCrypt (cost 12), 12–64 characters. There is no registration endpoint.
- **Brute force:** 10 attempts per IP per 15 min (429), and an account locks for 15 min after
  5 wrong passwords. Every failure returns the same "Invalid email or password."
- **First administrator:** set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, start the
  backend once, then remove `ADMIN_PASSWORD`. It is only used while no administrator exists.
- **Locked out / forgot the password:** delete the row and start again with new variables:

  ```bash
  docker exec -it portfolio-postgres psql -U portfolio -c "delete from admin_user;"
  ```

- **Uploads:** images (PNG, JPEG, WebP; 5 MB) and PDFs (10 MB), checked by their content, not
  their name. Stored under `UPLOAD_DIRECTORY` with random names; served by
  `GET /api/v1/assets/{id}` only once published (signed-in administrators can preview drafts).

### Studio endpoints (`/api/v1/admin`, administrator only)

| Area | Endpoints |
| --- | --- |
| Auth | `GET auth/csrf`, `POST auth/login`, `POST auth/logout`, `GET auth/me` |
| Account | `PUT account`, `PUT account/password` |
| Overview | `GET overview` |
| Publishing | `GET publications`, `POST publications` |
| Profile | `GET/PUT profile`, `POST profile/photo` |
| Resume | `GET/POST/DELETE resume` |
| Hero, About | `GET/PUT hero`, `GET/PUT about` |
| Sections | `GET sections`, `PUT sections/{key}`, `PUT sections/order` |
| Skills | `GET/POST skill-categories`, `PUT/DELETE skill-categories/{id}`, `PUT skill-categories/order`, `POST skill-categories/{id}/skills`, `PUT skill-categories/{id}/skills/order`, `PUT/DELETE skills/{id}` |
| Projects | `GET/POST projects`, `GET/PUT/DELETE projects/{id}`, `PUT projects/order`, `PATCH projects/{id}/visibility`, `POST projects/{id}/image` |
| Experience, education, social links | `GET/POST {experience,education,social-links}`, `PUT/DELETE …/{id}`, `PUT …/order` |
| Appearance, SEO | `GET/PUT appearance`, `GET/PUT seo`, `POST/DELETE seo/og-image` |
| Messages | `GET messages?status=&page=`, `GET/PATCH/DELETE messages/{id}` |

All edits change the **draft**. `POST publications` makes the draft live.

## API (v1)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/portfolio` | Complete published portfolio (what the website loads) |
| GET | `/api/v1/profile` | Published profile |
| GET | `/api/v1/projects` | Published projects |
| GET | `/api/v1/projects/{id}` | One project, by id or slug |
| GET | `/api/v1/skills` | Skill groups |
| GET | `/api/v1/experience` | Professional journey entries |
| GET | `/api/v1/education` | Education entries |
| GET | `/api/v1/social-links` | Social links that have a URL |
| POST | `/api/v1/contact` | Contact form (202, 400 with field errors, 429 with `Retry-After`) |

Errors use RFC 9457 problem responses (`application/problem+json`).

## How publishing works

- The content tables (`portfolio_profile`, `project`, …) hold the **draft**.
- Publishing builds a snapshot of the public portfolio and stores it in
  `portfolio_publication` with the next version number.
- Every public endpoint reads only the **latest snapshot**, so drafts never reach visitors
  and a publish is live on the next request, with no rebuild or redeploy.
- Hidden sections are published as `null`; hidden items and social links without a URL are
  left out.

## Package layout (`com.darshanpc.portfolio`)

```
config/       properties, CORS, persistence auditing, OpenAPI
controller/   public REST controllers
service/      published-content reads, contact handling
  publication/  snapshot assembly, publishing, first-run publish
repository/   Spring Data repositories
entity/       JPA entities (+ enums/)
dto/          request and response records (portfolio/, contact/)
mapper/       entity → public DTO mapping
security/     Spring Security config, session/CSRF setup, password policy, IP hashing,
              rate limiting (ratelimit/)
admin/        Portfolio Studio APIs: auth/, overview/, publication/, profile/, site/,
              projects/, skills/, entries/, messages/, support/
exception/    exception types and the global problem-response handler
validation/   custom constraints (@SingleLine)
util/         small helpers
```

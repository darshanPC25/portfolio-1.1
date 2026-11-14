# Deploy: Vercel + AWS Lambda + Neon

| Part | Where | Region |
| ---- | ----- | ------ |
| Frontend (React) | **Vercel** | global CDN |
| Backend (Spring Boot) | **AWS Lambda** + API Gateway HTTP API, Java 21, SnapStart | **ap-south-1 (Mumbai)** |
| Database | **Neon PostgreSQL** | **ap-southeast-1 (Singapore)** |

```text
visitor ──HTTPS──▶ Vercel (static site)
                     └─ /api/*  ──proxy──▶ API Gateway ──▶ Lambda (Spring Boot) ──TLS──▶ Neon PostgreSQL
```

Vercel forwards `/api/*` to AWS, so the browser only ever talks to your Vercel address. That
keeps the Studio's sign-in cookie first-party (`SameSite=Strict`, `Secure`, `HttpOnly`) and
needs no CORS in the browser.

Everything the backend keeps lives in Neon: content, publications, **uploaded files**,
**Studio sessions** and **rate-limit counters**. Lambda keeps nothing between requests.

> Time needed: about 45 minutes the first time. Cost at portfolio traffic: Neon free plan,
> Vercel Hobby (free), AWS Lambda/API Gateway usually within the free tier.

---

## 0. Install once

- **AWS CLI** (installed) and **AWS SAM CLI**: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
- **Java 21+** and **Node 20+** (installed)
- A GitHub repository with this project (yours: `darshanPC25/portfolio-1.1`). Commit and push first.

Sign the AWS CLI in (your own terminal):

```bash
aws configure          # or: aws login / aws configure sso
aws sts get-caller-identity
```

Use an IAM user or SSO role that can create Lambda, API Gateway, IAM roles, CloudFormation,
CloudWatch Logs and an S3 deployment bucket. Never use the AWS root account.

---

## 1. Neon database (Singapore)

1. https://console.neon.tech → **New project** → name `portfolio`, PostgreSQL **17**,
   region **AWS Asia Pacific (Singapore)**.
2. **Connect** → choose the database (`neondb`) and role. Copy **two** connection strings:
   - **Pooled** (host contains `-pooler`) → for the app.
   - **Direct** (toggle "Connection pooling" off) → for database migrations.
3. Convert both to JDBC form (drop the user and password from the URL; they are separate):

   ```text
   DbUrl          = jdbc:postgresql://ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&prepareThreshold=0
   DbMigrationUrl = jdbc:postgresql://ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   DbUsername     = neondb_owner        (your role)
   DbPassword     = (the role's password)
   ```

   `prepareThreshold=0` is required behind Neon's connection pooler.

The schema is created automatically by Flyway on the first deploy (migrations V1–V8) and the
seed content is published once.

---

## 2. Backend on AWS Lambda (Mumbai)

### 2.1 Build

```bash
cd backend
./mvnw test                                   # optional; needs Docker
./mvnw -Plambda package -DskipTests           # -> target/portfolio-backend-lambda.zip
```

### 2.2 Deploy

Prepare these values first:

| Parameter | Value |
| --------- | ----- |
| `DbUrl`, `DbMigrationUrl`, `DbUsername`, `DbPassword` | from step 1 |
| `SiteUrl` | Your Vercel address, e.g. `https://darshan-portfolio.vercel.app`. If you don't know it yet, deploy Vercel (step 3) first or use the project name you'll choose; you can change it later. |
| `ContactIpHashSalt` | a long random string: `openssl rand -base64 32` |
| `AdminEmail`, `AdminPassword` | your first Studio login (password 12–64 characters) |
| `MailHost`, `MailPort`, `MailUsername`, `MailPassword`, `MailFrom` | optional: `smtp.gmail.com`, `587`, your Gmail, an app password |
| `GitHubToken` | optional: your GitHub token (no scopes) for the contribution graph |

```bash
sam deploy --guided --region ap-south-1 --stack-name portfolio-backend \
  --capabilities CAPABILITY_IAM --resolve-s3
```

Answer the prompts with the values above. Say **N** to "Save arguments to configuration file"
if you don't want parameters stored in `samconfig.toml` (it is gitignored either way).

The first deploy takes a few minutes: SnapStart starts Spring Boot once, runs the migrations
against Neon and takes the snapshot. At the end SAM prints:

```text
ApiUrl       https://abc123.execute-api.ap-south-1.amazonaws.com
HealthCheck  https://abc123.execute-api.ap-south-1.amazonaws.com/actuator/health
```

Open the HealthCheck URL → `{"status":"UP"}`.

### 2.3 After the first sign-in: remove the admin password

Once you have signed in to the Studio (step 4), redeploy with an empty `AdminPassword` so it is
no longer in the function's settings:

```bash
sam deploy --region ap-south-1 --stack-name portfolio-backend --capabilities CAPABILITY_IAM --resolve-s3 \
  --parameter-overrides AdminPassword=""   # plus the other values again, or reuse samconfig.toml
```

---

## 3. Frontend on Vercel

1. Point the Vercel proxy at the backend and commit:

   ```bash
   cd frontend
   node scripts/set-api-origin.mjs https://abc123.execute-api.ap-south-1.amazonaws.com
   git add vercel.json && git commit -m "Point /api to the Lambda backend" && git push
   ```

2. https://vercel.com/new → **Import** `darshanPC25/portfolio-1.1`.
   - **Root Directory:** `frontend`
   - Framework: Vite (detected). Build and output settings come from `frontend/vercel.json`.
   - **Environment Variables** (Production):

     | Name | Value |
     | ---- | ----- |
     | `VITE_API_BASE_URL` | `/api/v1` |
     | `VITE_SITE_URL` | `https://<your-project>.vercel.app` (or your own domain) |
     | `VITE_MAX_IMAGE_MB` | `4` |
     | `VITE_MAX_DOCUMENT_MB` | `4` |

3. **Deploy.** If the final address differs from `SiteUrl` in step 2, redeploy the backend with
   the correct `SiteUrl` (it is used for CORS and in notification emails).

Every push to GitHub now redeploys the site automatically. Content changes never need a deploy:
publish in the Studio.

---

## 4. Check the live site

1. `https://<your-project>.vercel.app` → the portfolio loads (the first request after a quiet
   period takes about a second longer while Lambda restores).
2. Footer **Login** → sign in with `AdminEmail` / `AdminPassword`.
3. Studio → Profile → upload your photo (large photos are shrunk automatically) → **Publish** →
   the public site shows it.
4. Studio → Messages → **Send test email** (if you set the mail parameters), then send yourself a
   message through the contact form.
5. Remove the admin password (step 2.3).

---

## Updating later

- **Frontend:** `git push` (Vercel builds automatically).
- **Backend:** `./mvnw -Plambda package -DskipTests && sam deploy` (reuses `samconfig.toml`).
  New Flyway migrations run during the deploy, before the new version receives traffic.
- **Logs:** `sam logs --stack-name portfolio-backend --region ap-south-1 --tail`, or CloudWatch →
  Log groups → `/aws/lambda/portfolio-backend` (kept 30 days).

## Limits and trade-offs of this setup

- **Upload size 4 MB** (photos, screenshots and the resume PDF): a Lambda request/response can
  carry about 6 MB and files travel base64-encoded. Photos are resized in the browser first.
- **Files in Neon** count towards Neon's storage (0.5 GB on the free plan). Replaced files are kept
  (an older publication may still use them).
- **Mumbai ↔ Singapore** adds about 35–60 ms to every database query. The public site is barely
  affected (the published snapshot is cached); the Studio feels a little slower than locally.
- **Cold starts:** with SnapStart about 1–2 s after the function has been idle; then about 0.2 s.
  Neon's free plan also pauses the database after 5 minutes idle (about 0.5 s to wake up).
- **Direct API access:** the API Gateway address is public. Browsers can only sign in through the
  Vercel address; visitor addresses for rate limiting come from Vercel's `X-Forwarded-For`, so a
  global cap (30 contact messages per hour) also protects the contact form. API Gateway throttles
  at 25 requests/second (burst 50).
- **Secrets** are encrypted Lambda environment variables (NoEcho parameters). For stricter setups,
  move them to AWS Secrets Manager.

## Security checklist

- [ ] AWS: not the root account; MFA on.
- [ ] `AdminPassword` removed after the first sign-in (step 2.3).
- [ ] Gmail uses an **app password**; `GitHubToken` has no scopes.
- [ ] Neon: only you have console access; the role password is not in git.
- [ ] `samconfig.toml`, `.env`, `.env.production` are not committed (all gitignored).

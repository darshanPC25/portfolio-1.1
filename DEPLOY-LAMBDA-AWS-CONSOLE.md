# Backend on AWS Lambda — using the AWS Console (no SAM CLI)

This replaces **step 2** of [DEPLOY-VERCEL-LAMBDA-NEON.md](DEPLOY-VERCEL-LAMBDA-NEON.md). It
creates the same thing as `backend/template.yaml`, by clicking in the AWS Console:

```text
API Gateway (HTTP API) ──▶ Lambda alias "live" ──▶ version with SnapStart ──▶ Neon (Singapore)
```

Do the **Neon** step first (step 1 of the main guide) so you have `DbUrl`, `DbMigrationUrl`,
`DbUsername` and `DbPassword`.

> In the top-right corner of the console, always select **Asia Pacific (Mumbai) ap-south-1**.
> Sign in as an IAM user or SSO role with MFA, not the root account.

---

## 1. Build the package (your computer)

```bash
cd backend
./mvnw -Plambda package -DskipTests
```

Result: `backend/target/portfolio-backend-lambda.zip` (about 62 MB).
Lambda accepts at most 50 MB uploaded from the browser, so the zip goes through S3.

---

## 2. Upload the zip to S3

1. Console → **S3** → **Create bucket**
   - Bucket name: something unique, e.g. `darshan-portfolio-deploy-<random>`
   - Region: **ap-south-1**
   - Object Ownership: ACLs disabled · **Block all public access: on** (default)
   - Default encryption: SSE-S3 (default) → **Create bucket**
2. Open the bucket → **Upload** → **Add files** → `portfolio-backend-lambda.zip` → **Upload**.
3. Click the uploaded file and copy its **Object URL**, e.g.
   `https://darshan-portfolio-deploy-xxxx.s3.ap-south-1.amazonaws.com/portfolio-backend-lambda.zip`

---

## 3. Create the Lambda function

Console → **Lambda** → **Create function**

| Field | Value |
| ----- | ----- |
| Option | **Author from scratch** |
| Function name | `portfolio-backend` |
| Runtime | **Java 21** |
| Architecture | **arm64** |
| Execution role | **Create a new role with basic Lambda permissions** |

→ **Create function**. (The role only allows writing logs. The function needs nothing else from AWS.)

### 3.1 Code and handler

1. Tab **Code** → **Upload from** → **Amazon S3 location** → paste the Object URL → **Save**.
2. Still on **Code**, scroll to **Runtime settings** → **Edit**:
   - Handler: `com.darshanpc.portfolio.lambda.StreamLambdaHandler::handleRequest`
   - → **Save**

### 3.2 Memory, timeout, SnapStart

Tab **Configuration** → **General configuration** → **Edit**:

| Field | Value |
| ----- | ----- |
| Memory | **2048** MB (more memory = more CPU = faster) |
| Ephemeral storage | 512 MB (default) |
| Timeout | **0 min 29 sec** (API Gateway waits at most 30 s) |
| SnapStart | **PublishedVersions** |

→ **Save**.

### 3.3 Environment variables

**Configuration** → **Environment variables** → **Edit** → **Add environment variable** for each:

| Key | Value |
| --- | ----- |
| `SPRING_PROFILES_ACTIVE` | `prod,lambda` |
| `JAVA_TOOL_OPTIONS` | `-XX:+TieredCompilation -XX:TieredStopAtLevel=1` |
| `DB_URL` | Neon **pooled** JDBC URL, e.g. `jdbc:postgresql://ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&prepareThreshold=0` |
| `DB_MIGRATION_URL` | Neon **direct** JDBC URL, e.g. `jdbc:postgresql://ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | your Neon role, e.g. `neondb_owner` |

> **Do not paste Neon's connection string as it is.** Neon shows
> `postgresql://neondb_owner:PASSWORD@ep-xxxx.../neondb?sslmode=require`. The JDBC driver cannot
> read a user and password inside the URL ("Unable to parse URL"), and the URL would end up in
> the logs. Remove `neondb_owner:PASSWORD@`, put `jdbc:` in front, and give the user and password
> in `DB_USERNAME` / `DB_PASSWORD`:
>
> ```text
> wrong: postgresql://neondb_owner:PASSWORD@ep-xxxx-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
> right: jdbc:postgresql://ep-xxxx-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&prepareThreshold=0
> ```

| `DB_PASSWORD` | the Neon role's password |
| `CORS_ALLOWED_ORIGINS` | your Vercel address, e.g. `https://darshan-portfolio.vercel.app` (no trailing slash) |
| `CONTACT_IP_HASH_SALT` | a long random string (e.g. from `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | your Studio login email |
| `ADMIN_PASSWORD` | your first Studio password (12–64 characters) — **delete after the first sign-in** |
| `ADMIN_DISPLAY_NAME` | `Darshan` |

Optional:

| Key | Value |
| --- | ----- |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | your Gmail address / a Gmail **app password** |
| `GITHUB_TOKEN` | your GitHub token (no scopes) for the contribution graph |

→ **Save**. (Lambda encrypts these at rest. Anyone with access to this function in your AWS
account can read them, so keep your AWS account to yourself and use MFA.)

### 3.4 Publish a version (this starts Spring and creates the database)

With SnapStart, the code runs **when you publish a version**: Spring Boot starts, Flyway creates
all tables in Neon, the seed content is published and your admin account is created. Then AWS
saves a snapshot that every later cold start restores in about a second.

1. Top-right **Actions** → **Publish new version** → Description `v1` → **Publish**.
2. Wait until the version page shows **State: Active** (a few minutes the first time).
   - If it shows **Failed**: open **Monitor** → **View CloudWatch logs**, read the newest log
     stream (usually a wrong `DB_URL` / password, or a typo in the handler).

### 3.5 Create the alias `live`

Visitors always go through an alias, so you can switch versions without touching API Gateway.

**Aliases** tab → **Create alias**
- Name: `live`
- Version: `1`
- → **Save**

Copy the alias ARN shown at the top, ending in `:live`, e.g.
`arn:aws:lambda:ap-south-1:123456789012:function:portfolio-backend:live`

---

## 4. Create the HTTP API (API Gateway)

Console → **API Gateway** → **Create API** → **HTTP API** → **Build**

1. **Integrations** → **Add integration**
   - Integration type: **Lambda**
   - AWS Region: **ap-south-1**
   - Lambda function: paste the **alias ARN** ending in `:live` (not the plain function)
   - Version: **2.0**
   - API name: `portfolio-api` → **Next**
2. **Configure routes**
   - Method: **ANY**
   - Resource path: `/{proxy+}`
   - Integration target: `portfolio-backend` → **Next**
3. **Define stages**: stage `$default`, **Auto-deploy: on** → **Next** → **Create**.

Copy the **Invoke URL**, e.g. `https://abc123.execute-api.ap-south-1.amazonaws.com`. This is your
**ApiUrl**.

### 4.1 Check the permission

The console normally adds API Gateway's permission to call the function. To make sure:
Lambda → `portfolio-backend` → **Aliases** → `live` → **Configuration** → **Permissions** →
**Resource-based policy statements** should list `apigateway.amazonaws.com`.

If it is empty: **Add permissions** →
- **AWS service** → Service: **API Gateway**
- Statement ID: `apigateway-invoke`
- Principal: `apigateway.amazonaws.com`
- Source ARN: `arn:aws:execute-api:ap-south-1:<your-account-id>:<api-id>/*/*/{proxy+}`
  (the api-id is the `abc123` part of the Invoke URL)
- Action: `lambda:InvokeFunction` → **Save**

### 4.2 Throttling (limits cost if someone floods the API)

API Gateway → `portfolio-api` → **Protect** → **Throttling** → **Edit** (default route throttling):
- Burst limit **50**, Rate limit **25** → **Save**

### 4.3 Test

Open in the browser:

```text
https://abc123.execute-api.ap-south-1.amazonaws.com/actuator/health     → {"status":"UP"}
https://abc123.execute-api.ap-south-1.amazonaws.com/api/v1/portfolio    → your portfolio as JSON
```

The very first request after publishing can take a few seconds; then it is fast.

---

## 5. Keep logs for 30 days (optional)

Console → **CloudWatch** → **Log groups** → `/aws/lambda/portfolio-backend` → **Actions** →
**Edit retention setting** → **1 month** → **Save**.

---

## 6. Continue with Vercel

Go back to the main guide, **step 3**, and run with your Invoke URL:

```bash
cd frontend
node scripts/set-api-origin.mjs https://abc123.execute-api.ap-south-1.amazonaws.com
```

---

## Changing settings or deploying new code later

Lambda serves the version the alias `live` points to. **Every change needs a new version and
the alias moved to it**, or visitors keep getting the old one:

1. **New code:** build the zip again → upload it to the same S3 location (replace) → Lambda →
   **Code** → **Upload from** → **Amazon S3 location** → same URL → **Save**.
   **Changed settings only:** edit them under **Configuration** → **Environment variables** → **Save**.
2. **Actions** → **Publish new version** → wait for **State: Active**.
3. **Aliases** → `live` → **Edit** → choose the new version → **Save**.

If something goes wrong, point `live` back to the previous version: an instant rollback.

### After your first Studio sign-in: remove the admin password

Environment variables → delete `ADMIN_PASSWORD` (keep `ADMIN_EMAIL`) → **Save** → publish a new
version → move `live` to it. Your account stays in the database; the password no longer sits in
the function's settings.

## Clean-up of old versions (optional)

Each version keeps a snapshot. Every few deploys, delete versions older than the one `live` uses:
**Versions** tab → select old ones → **Delete**.

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

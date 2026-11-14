# Frontend image: builds the static site with Vite, then serves it with nginx.
# nginx also forwards /api/ to the backend, so the browser talks to one origin.
# Build from the frontend/ directory:
#   docker build --build-arg VITE_SITE_URL=https://your-domain.example -t portfolio-frontend .

# Same Node major as development, so package-lock.json resolves identically.
FROM node:25-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Same-origin API path (proxied by nginx). Override for a separate API domain.
ARG VITE_API_BASE_URL=/api/v1
# Public address of the site, used for sitemap.xml and robots.txt.
ARG VITE_SITE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

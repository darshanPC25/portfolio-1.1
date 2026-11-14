/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** REST API base, e.g. http://localhost:8080/api/v1, or /api/v1 behind a proxy (nginx, Vercel). */
  readonly VITE_API_BASE_URL?: string
  /** Public site address, used for sitemap.xml and robots.txt. */
  readonly VITE_SITE_URL?: string
  /** Upload limits shown and enforced by the Studio (must match the backend). */
  readonly VITE_MAX_IMAGE_MB?: string
  readonly VITE_MAX_DOCUMENT_MB?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

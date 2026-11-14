import type { Plugin } from 'vite'

/**
 * Writes robots.txt and sitemap.xml into the build output.
 *
 * The public URL comes from VITE_SITE_URL (for example https://darshan.dev).
 * Without it the build still produces robots.txt, but no sitemap, because a
 * sitemap must contain absolute URLs.
 *
 * The site is a single page with section anchors, so the sitemap has one URL.
 * /admin is private and disallowed for crawlers.
 */
export function seoFiles(siteUrl: string | undefined): Plugin {
  const base = siteUrl?.trim().replace(/\/+$/, '') || null

  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    ...(base ? ['', `Sitemap: ${base}/sitemap.xml`] : []),
    '',
  ].join('\n')

  const sitemap = (lastmod: string) =>
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '  <url>',
      `    <loc>${base}/</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      '    <changefreq>monthly</changefreq>',
      '    <priority>1.0</priority>',
      '  </url>',
      '</urlset>',
      '',
    ].join('\n')

  return {
    name: 'portfolio-seo-files',
    // Dev server: answer /robots.txt and /sitemap.xml the same way.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(robots)
        } else if (req.url === '/sitemap.xml' && base) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          res.end(sitemap(new Date().toISOString().slice(0, 10)))
        } else {
          next()
        }
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
      if (base) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: sitemap(new Date().toISOString().slice(0, 10)),
        })
      } else {
        this.warn('VITE_SITE_URL is not set: sitemap.xml was not generated.')
      }
    },
  }
}

/**
 * Starts downloading the published portfolio while the JavaScript is still
 * loading, instead of after React has started. The request matches the one
 * the site makes (CORS, no credentials), so the browser reuses the response.
 */
export function preloadContent(apiBaseUrl: string): Plugin {
  const href = `${apiBaseUrl.replace(/\/+$/, '')}/portfolio`
  return {
    name: 'portfolio-preload-content',
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href,
            as: 'fetch',
            crossorigin: 'anonymous',
          },
          injectTo: 'head',
        },
      ]
    },
  }
}

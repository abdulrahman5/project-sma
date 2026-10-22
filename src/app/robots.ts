import type { MetadataRoute } from 'next'

import { isIndexable, siteUrl } from '@/lib/payload'

// Until the site runs on its real domain, search engines are asked not to index it.
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}

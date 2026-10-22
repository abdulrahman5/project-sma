import type { MetadataRoute } from 'next'

import { getNews, siteUrl } from '@/lib/payload'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const posts = await getNews()
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/news`, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({ url: `${base}/news/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ]
}

import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media } from '@/payload-types'
import { getSiteUrl } from './site-url'

export const getClient = cache(() => getPayload({ config }))

// Public queries run with the visitor's (anonymous) permissions, so drafts are never shown.
export const getSettings = cache(async () => (await getClient()).findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: false }))
export const getAbout = cache(async () => (await getClient()).findGlobal({ slug: 'about', depth: 1, overrideAccess: false }))
export const getAgenda = cache(async () => (await getClient()).findGlobal({ slug: 'agenda', depth: 0, overrideAccess: false }))

export const getProjects = cache(async () =>
  (await getClient()).find({ collection: 'projects', depth: 1, sort: 'order', pagination: false, overrideAccess: false }).then((r) => r.docs),
)

export const getNews = cache(async (limit?: number) =>
  (await getClient())
    .find({ collection: 'news', depth: 1, sort: '-publishedDate', limit: limit ?? 0, pagination: Boolean(limit), overrideAccess: false })
    .then((r) => r.docs),
)

export const getPost = cache(async (slug: string) =>
  (await getClient())
    .find({ collection: 'news', depth: 1, where: { slug: { equals: slug } }, limit: 1, overrideAccess: false })
    .then((r) => r.docs[0] ?? null),
)

// ---------- presentation helpers ----------

export const siteUrl = getSiteUrl

/** Text in [square brackets] is placeholder copy that still needs to be filled in. */
export const isPlaceholder = (s?: string | null) => Boolean(s && /^\s*\[.*\]\s*$/s.test(s))
export const ph = (s?: string | null) => (isPlaceholder(s) ? 'placeholder' : undefined)

export const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m ? (m as Media) : null)

export const imageUrl = (m: unknown, size?: 'thumbnail' | 'card' | 'large') => {
  const media = asMedia(m)
  if (!media) return null
  return (size && media.sizes?.[size]?.url) || media.url || null
}

export const absoluteUrl = (u?: string | null) => (!u ? undefined : u.startsWith('http') ? u : siteUrl() + u)

export const hex = (v: string | null | undefined, fallback: string) => (v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback)

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }) : ''

/** Search engines may index the site only once it is served from its real domain (not *.vercel.app). */
export const isIndexable = () => {
  const url = getSiteUrl()
  return url.startsWith('https://') && !/\.vercel\.app$/i.test(new URL(url).hostname)
}

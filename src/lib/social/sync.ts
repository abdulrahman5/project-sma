// Imports the latest Facebook Page and Instagram posts through Meta's Graph API.
// Configured with two Vercel environment variables:
//   META_PAGE_ID            – the Facebook Page's numeric ID
//   META_PAGE_ACCESS_TOKEN  – a (non-expiring) Page access token
// Instagram is found automatically through the Page (it must be a Business/Creator account linked to it).
import type { Payload } from 'payload'

type Platform = 'facebook' | 'instagram'
type Item = { platform: Platform; externalId: string; url: string; text: string; imageUrl?: string; postedAt: string }
type Result = { imported: number; updated: number; skipped?: string; error?: string }

const LIMIT = 20
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 15 * 1024 * 1024

const graphBase = () =>
  (process.env.META_GRAPH_BASE || 'https://graph.facebook.com').replace(/\/$/, '') +
  (process.env.META_GRAPH_VERSION ? `/${process.env.META_GRAPH_VERSION}` : '')

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(graphBase() + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('access_token', process.env.META_PAGE_ACCESS_TOKEN || '')
  const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
  const json = (await r.json().catch(() => ({}))) as T & { error?: { message?: string } }
  if (!r.ok || json.error) throw new Error(json.error?.message || `Meta API returned HTTP ${r.status}`)
  return json
}

async function fetchFacebook(pageId: string): Promise<Item[]> {
  const { data } = await graph<{ data: Array<Record<string, string | undefined>> }>(`/${pageId}/posts`, {
    fields: 'id,message,created_time,permalink_url,full_picture',
    limit: String(LIMIT),
  })
  return data
    .filter((p) => p.id && p.permalink_url && (p.message || p.full_picture))
    .map((p) => ({
      platform: 'facebook',
      externalId: `facebook:${p.id}`,
      url: p.permalink_url!,
      text: p.message ?? '',
      imageUrl: p.full_picture,
      postedAt: new Date(p.created_time!).toISOString(),
    }))
}

async function fetchInstagram(pageId: string): Promise<Item[] | string> {
  const page = await graph<{ instagram_business_account?: { id: string } }>(`/${pageId}`, { fields: 'instagram_business_account' })
  const igId = page.instagram_business_account?.id
  if (!igId) return 'No Instagram Business/Creator account is linked to the Facebook Page.'
  const { data } = await graph<{ data: Array<Record<string, string | undefined>> }>(`/${igId}/media`, {
    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
    limit: String(LIMIT),
  })
  return data
    .filter((m) => m.id && m.permalink)
    .map((m) => ({
      platform: 'instagram',
      externalId: `instagram:${m.id}`,
      url: m.permalink!,
      text: m.caption ?? '',
      imageUrl: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url,
      postedAt: new Date(m.timestamp!).toISOString(),
    }))
}

// Copy the post photo into the site's own photo library (so the site never loads images from Meta).
async function saveImage(payload: Payload, item: Item): Promise<number | undefined> {
  if (!item.imageUrl) return undefined
  try {
    const r = await fetch(item.imageUrl, { signal: AbortSignal.timeout(15000) })
    const type = (r.headers.get('content-type') || '').split(';')[0].trim()
    if (!r.ok || !IMAGE_TYPES.includes(type)) return undefined
    const data = Buffer.from(await r.arrayBuffer())
    if (data.length > MAX_IMAGE_BYTES) return undefined
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'
    const media = await payload.create({
      collection: 'media',
      data: { alt: item.text.replace(/\s+/g, ' ').slice(0, 120) || `${item.platform} post photo` },
      file: { data, mimetype: type, name: `${item.externalId.replace(/[^a-z0-9]+/gi, '-')}.${ext}`, size: data.length },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    return media.id
  } catch (err) {
    payload.logger.warn({ err, url: item.url }, 'Could not copy social post image')
    return undefined
  }
}

async function upsert(payload: Payload, items: Item[], ignored: Set<string>): Promise<Result> {
  const result: Result = { imported: 0, updated: 0 }
  const context = { socialImport: true, disableRevalidate: true }
  const work = items.filter((i) => !ignored.has(i.externalId))

  // A few at a time, to stay well within the serverless time limit.
  for (let i = 0; i < work.length; i += 4) {
    await Promise.all(
      work.slice(i, i + 4).map(async (item) => {
        const { docs } = await payload.find({
          collection: 'social-posts',
          where: { externalId: { equals: item.externalId } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const existing = docs[0]
        if (existing) {
          if (existing.text !== item.text || existing.url !== item.url) {
            await payload.update({ collection: 'social-posts', id: existing.id, data: { text: item.text, url: item.url }, overrideAccess: true, context })
            result.updated++
          }
          return
        }
        const image = await saveImage(payload, item)
        await payload.create({
          collection: 'social-posts',
          data: { ...item, image, source: 'imported', hidden: false },
          overrideAccess: true,
          context,
        })
        result.imported++
      }),
    )
  }
  return result
}

export async function syncSocial(payload: Payload) {
  const settings = await payload.findGlobal({ slug: 'social-settings', overrideAccess: true })
  const ignored = new Set<string>(Array.isArray(settings.ignoredIds) ? (settings.ignoredIds as string[]) : [])
  const pageId = process.env.META_PAGE_ID
  const connected = Boolean(pageId && process.env.META_PAGE_ACCESS_TOKEN)
  const results: Record<Platform, Result> = {
    facebook: { imported: 0, updated: 0 },
    instagram: { imported: 0, updated: 0 },
  }

  const run = async (platform: Platform, enabled: boolean | null | undefined, fetcher: () => Promise<Item[] | string>) => {
    if (!connected) return (results[platform].skipped = 'Not connected (META_PAGE_ID / META_PAGE_ACCESS_TOKEN are not set in Vercel).')
    if (enabled === false) return (results[platform].skipped = 'Turned off in Social media sync settings.')
    try {
      const items = await fetcher()
      if (typeof items === 'string') results[platform].skipped = items
      else results[platform] = await upsert(payload, items, ignored)
    } catch (err) {
      results[platform].error = err instanceof Error ? err.message : String(err)
      payload.logger.error({ err }, `${platform} sync failed`)
    }
  }

  await run('facebook', settings.importFacebook, () => fetchFacebook(pageId!))
  await run('instagram', settings.importInstagram, () => fetchInstagram(pageId!))

  const describe = (name: string, r: Result) =>
    `${name}: ${r.error ? `error — ${r.error}` : r.skipped ? r.skipped : `${r.imported} new, ${r.updated} updated`}`
  const summary = [describe('Facebook', results.facebook), describe('Instagram', results.instagram)].join('\n')

  await payload.updateGlobal({
    slug: 'social-settings',
    data: { lastSyncAt: new Date().toISOString(), lastSyncSummary: summary },
    overrideAccess: true,
  })
  return { ok: !results.facebook.error && !results.instagram.error, connected, results, summary }
}

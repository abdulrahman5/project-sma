// X (Twitter) posts are added by pasting a link. The post text is read from X's public oEmbed
// endpoint (no API key, free) and stored, so the site shows its own card without loading X's scripts.

const OEMBED = () => (process.env.X_OEMBED_BASE || 'https://publish.twitter.com').replace(/\/$/, '')

export function parseXUrl(input: string): { id: string; url: string } | null {
  try {
    const u = new URL(input.trim())
    if (!/^(www\.|mobile\.)?(x|twitter)\.com$/i.test(u.hostname)) return null
    const m = u.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d{5,25})/)
    return m ? { id: m[2], url: `https://x.com/${m[1]}/status/${m[2]}` } : null
  } catch {
    return null
  }
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))

export async function fetchXPost(url: string): Promise<{ text: string; postedAt?: string } | null> {
  const r = await fetch(`${OEMBED()}/oembed?omit_script=1&dnt=true&url=${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })
  if (!r.ok) return null
  const { html } = (await r.json()) as { html?: string }
  if (!html) return null

  const body = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? ''
  const text = decode(
    body
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<a[^>]*>(pic\.twitter\.com\/\S+?)<\/a>/gi, '') // attached-photo links
      .replace(/<[^>]+>/g, ''),
  ).trim()

  // The last link in the embed is the post date, e.g. "October 1, 2026"
  const dateText = [...html.matchAll(/<a[^>]*>([^<]+)<\/a>/gi)].pop()?.[1]
  const date = dateText ? new Date(`${decode(dateText)} 12:00 UTC`) : null
  return { text, postedAt: date && !isNaN(+date) ? date.toISOString() : undefined }
}

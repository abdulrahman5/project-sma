import { asMedia, imageUrl } from '@/lib/payload'

// Uploaded photo, or a labelled placeholder box until one is added in the admin.
export function Img({ media, size, label, alt }: { media: unknown; size?: 'thumbnail' | 'card' | 'large'; label: string; alt?: string }) {
  const m = asMedia(media)
  const src = imageUrl(media, size)
  if (!m || !src) return <div className="img-ph">{label}</div>
  const focal = m.focalX != null && m.focalY != null ? `${m.focalX}% ${m.focalY}%` : undefined
  return <img src={src} alt={alt ?? m.alt ?? ''} loading="lazy" style={focal ? { objectPosition: focal } : undefined} />
}

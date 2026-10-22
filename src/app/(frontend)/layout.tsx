import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { absoluteUrl, getSettings, hex, imageUrl, isIndexable, siteUrl } from '@/lib/payload'
import { MobileNav } from './MobileNav'
import './styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const title = `${s.name} | ${s.constituency ?? ''}`.replace(/ \| $/, '')
  const image = absoluteUrl(imageUrl(s.shareImage, 'large') || imageUrl(s.hero?.image, 'large'))
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s | ${s.name}` },
    description: s.seoDescription ?? undefined,
    icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
    openGraph: { type: 'website', title, description: s.seoDescription ?? undefined, siteName: s.name, images: image ? [image] : undefined },
    twitter: { card: 'summary_large_image' },
    robots: isIndexable() ? undefined : { index: false, follow: false },
  }
}

const SOCIALS = [
  ['facebook', 'Facebook', 'f'],
  ['x', 'X / Twitter', '𝕏'],
  ['instagram', 'Instagram', '◎'],
  ['youtube', 'YouTube', '▶'],
  ['tiktok', 'TikTok', '♪'],
] as const

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const s = await getSettings()
  const brand = hex(s.primaryColor, '#0b5d3b')
  const accent = hex(s.accentColor, '#c8a13a')
  const socials = SOCIALS.filter(([k]) => s.socials?.[k])

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={brand} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap"
        />
        <style>{`:root{--brand:${brand};--accent:${accent}}`}</style>
      </head>
      <body>
        <header>
          <div className="wrap nav">
            <Link href="/" className="logo">
              <span className="logo-mark">{s.shortName}</span>
              <span>
                {s.name}
                <small>{s.constituency}</small>
              </span>
            </Link>
            <MobileNav>
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#agenda">Agenda</Link></li>
              <li><Link href="/#journey">Journey</Link></li>
              <li><Link href="/#projects">Projects</Link></li>
              <li><Link href="/news">News</Link></li>
              <li><Link href="/#involve" className="btn btn-green">Get Involved</Link></li>
            </MobileNav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="wrap">
            <div className="foot">
              <Link href="/" className="logo">
                <span className="logo-mark">{s.shortName}</span>
                <span>
                  {s.name}
                  <small>{[s.hero?.headline, s.hero?.highlight].filter(Boolean).join(' ')}</small>
                </span>
              </Link>
              {socials.length > 0 && (
                <div className="socials">
                  {socials.map(([k, label, glyph]) => (
                    <a key={k} href={s.socials![k]!} aria-label={label} target="_blank" rel="noopener noreferrer">{glyph}</a>
                  ))}
                </div>
              )}
            </div>
            <div className="copy">© {new Date().getFullYear()} Office of {s.name}. All rights reserved.</div>
          </div>
        </footer>
      </body>
    </html>
  )
}

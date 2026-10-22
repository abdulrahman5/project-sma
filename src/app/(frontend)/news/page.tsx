import type { Metadata } from 'next'

import { getNews, getSettings } from '@/lib/payload'
import { PostCard } from '../PostCard'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return { title: 'News', description: `Latest news and press releases from the office of ${s.name}.`, alternates: { canonical: '/news' } }
}

export default async function NewsIndex() {
  const posts = await getNews()
  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <span className="eyebrow">Newsroom</span>
          <h1>News &amp; press releases</h1>
        </div>
      </div>
      <section>
        <div className="wrap">
          {posts.length ? (
            <div className="news" style={{ marginTop: 0 }}>{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
          ) : (
            <p className="lead">No news yet. Check back soon.</p>
          )}
        </div>
      </section>
    </>
  )
}

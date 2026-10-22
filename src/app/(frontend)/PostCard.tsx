import Link from 'next/link'

import { formatDate, ph } from '@/lib/payload'
import type { News } from '@/payload-types'

export function PostCard({ post }: { post: News }) {
  return (
    <article className="post">
      <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
      <h3><Link href={`/news/${post.slug}`}><span className={ph(post.title)}>{post.title}</span></Link></h3>
      <p className={ph(post.summary)}>{post.summary}</p>
      <Link className="more" href={`/news/${post.slug}`}>Read more →</Link>
    </article>
  )
}

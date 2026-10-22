import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { absoluteUrl, formatDate, getNews, getPost, imageUrl, ph } from '@/lib/payload'
import { Img } from '../../Img'

export const dynamic = 'force-static'
// Posts published after the last deploy are rendered on first visit, then cached.
export const dynamicParams = true

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getNews()
  return posts.filter((p) => p.slug).map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  const image = absoluteUrl(imageUrl(post.image, 'large'))
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.summary, publishedTime: post.publishedDate, images: image ? [image] : undefined },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  return (
    <article className="article">
      <Link className="back" href="/news">← All news</Link>
      <h1><span className={ph(post.title)}>{post.title}</span></h1>
      <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
      {post.image && typeof post.image === 'object' && (
        <div className="cover"><Img media={post.image} size="large" label="" /></div>
      )}
      {post.body && <RichText data={post.body} className="prose" />}
    </article>
  )
}

// Loads the starter content in seed/data into a brand-new database.
// Runs automatically during every build, but does nothing once the site has been set up
// (so content deleted by admins is never brought back). `npm run seed -- --force` overwrites pages and settings.
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

const DATA = path.resolve(process.cwd(), 'seed/data')
const force = process.argv.includes('--force')
const readJson = (f: string) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'))

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown })
const context = { disableRevalidate: true }

const current = await payload.findGlobal({ slug: 'site-settings' })
if (current.name && !force) {
  payload.logger.info('Site already set up — skipping seed')
  process.exit(0)
}

const site = readJson('site.json')
await payload.updateGlobal({
  slug: 'site-settings',
  context,
  data: {
    name: site.name,
    shortName: site.shortName,
    office: site.office,
    constituency: site.constituency,
    state: site.state,
    party: site.party,
    seoDescription: site.seoDescription,
    primaryColor: site.colors.primary,
    accentColor: site.colors.accent,
    hero: { badge: site.hero.badge, headline: site.hero.headline, highlight: site.hero.highlight, intro: site.hero.intro },
    stats: site.stats,
    quote: site.quote,
    contact: site.contact,
    socials: Object.fromEntries(Object.entries(site.socials).map(([k, v]) => [k, v || null])),
  },
})
payload.logger.info('Seeded site settings')

const about = readJson('about.json')
await payload.updateGlobal({
  slug: 'about',
  context,
  data: { heading: about.heading, body: md(about.body), facts: about.facts, timeline: about.timeline },
})
payload.logger.info('Seeded about page')

const agenda = readJson('agenda.json')
await payload.updateGlobal({ slug: 'agenda', context, data: agenda })
payload.logger.info('Seeded agenda')

if ((await payload.count({ collection: 'projects' })).totalDocs === 0) {
  for (const f of fs.readdirSync(path.join(DATA, 'projects')).filter((f) => f.endsWith('.json')).sort()) {
    const p = readJson(`projects/${f}`)
    await payload.create({
      collection: 'projects',
      context,
      data: { title: p.title, category: p.category, location: p.location, year: p.year, summary: p.summary, order: p.order, _status: 'published' },
    })
  }
  payload.logger.info('Seeded projects')
}

if ((await payload.count({ collection: 'news' })).totalDocs === 0) {
  for (const f of fs.readdirSync(path.join(DATA, 'news')).filter((f) => f.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(DATA, 'news', f), 'utf8')
    const [, front = '', body = ''] = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? []
    const meta = Object.fromEntries(
      front.split('\n').map((l) => {
        const i = l.indexOf(':')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')]
      }),
    )
    await payload.create({
      collection: 'news',
      context,
      data: {
        title: meta.title,
        summary: meta.summary,
        publishedDate: meta.date,
        slug: f.replace(/\.md$/, ''),
        body: md(body.trim()),
        _status: 'published',
      },
    })
  }
  payload.logger.info('Seeded news')
}

payload.logger.info('Seed complete')
process.exit(0)

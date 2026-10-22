import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { News } from './collections/News'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { Agenda } from './globals/Agenda'
import { SiteSettings } from './globals/SiteSettings'
import { getSiteUrl } from './lib/site-url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Vercel's Neon integration provides DATABASE_URL (pooled); POSTGRES_URL is accepted as a fallback.
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

// On Vercel, fail early with a clear message instead of a confusing "cannot connect to 127.0.0.1" error.
if (process.env.VERCEL) {
  const missing = [!databaseUrl && 'DATABASE_URL', !process.env.PAYLOAD_SECRET && 'PAYLOAD_SECRET'].filter(Boolean)
  if (missing.length) {
    throw new Error(
      `Missing environment variable(s): ${missing.join(', ')}. ` +
        'Add them in Vercel → Project → Settings → Environment Variables (tick Production), then redeploy. ' +
        'DATABASE_URL is added automatically when a Neon database is connected in the Storage tab.',
    )
  }
}

export default buildConfig({
  serverURL: getSiteUrl(),
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    // Built-in avatar instead of Gravatar, so admin email hashes are not sent to a third party.
    avatar: 'default',
    meta: {
      titleSuffix: ' · SMA Admin',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
    },
  },
  collections: [News, Projects, Media, Messages, Users],
  globals: [SiteSettings, About, Agenda],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: databaseUrl },
    // Schema changes always go through migrations (src/migrations), locally and in production.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  graphQL: { disable: true },
  sharp,
  telemetry: false,
  // Without a Resend key (e.g. local development) emails are printed to the console instead.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Office of Hon. Saidu Musa Abdullahi',
      })
    : undefined,
  plugins: [
    // Photos go to Vercel Blob in production; locally (no token) they are saved to ./media.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Upload straight from the browser to Blob, avoiding Vercel's 4.5 MB request limit for phone photos.
      clientUploads: true,
    }),
  ],
})

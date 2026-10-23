import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { syncSocial } from '@/lib/social/sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET:  the daily Vercel Cron job (authenticated with CRON_SECRET).
// POST: the "Sync now" button in the admin (authenticated with the admin's login session).
async function handle(req: Request, allow: 'cron' | 'admin') {
  const payload = await getPayload({ config })

  if (allow === 'cron') {
    const secret = process.env.CRON_SECRET
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    const { user } = await payload.auth({ headers: req.headers })
    const role = (user as { role?: string } | null)?.role
    if (!user || !['superadmin', 'editor'].includes(role ?? '')) {
      return Response.json({ error: 'Only Editors and Super Admins can sync social media.' }, { status: 403 })
    }
  }

  const result = await syncSocial(payload)
  revalidatePath('/', 'layout')
  return Response.json(result)
}

export const GET = (req: Request) => handle(req, 'cron')
export const POST = (req: Request) => handle(req, 'admin')

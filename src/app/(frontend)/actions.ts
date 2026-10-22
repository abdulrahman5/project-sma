'use server'

import { MESSAGE_TOPICS } from '@/collections/Messages'
import { getClient } from '@/lib/payload'

export type ContactState = { ok: boolean; error?: string }

const field = (fd: FormData, name: string, max: number) => String(fd.get(name) ?? '').trim().slice(0, max)
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function submitMessage(_prev: ContactState, fd: FormData): Promise<ContactState> {
  // Spam traps: a hidden field real visitors never fill in, and a minimum time on the page.
  const startedAt = Number(fd.get('startedAt'))
  if (field(fd, 'website', 200) || !startedAt || Date.now() - startedAt < 3000) {
    return { ok: true }
  }

  const name = field(fd, 'name', 120)
  const email = field(fd, 'email', 200)
  const message = field(fd, 'message', 5000)
  const topic = field(fd, 'topic', 50)
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please enter your name and a valid email address.' }
  }

  const data = {
    name,
    email,
    phone: field(fd, 'phone', 40),
    ward: field(fd, 'ward', 120),
    topic: (MESSAGE_TOPICS.includes(topic) ? topic : 'Share feedback') as 'Share feedback',
    message,
    status: 'new' as const,
  }

  try {
    const payload = await getClient()
    // The public cannot create messages through the API; this trusted server action can.
    await payload.create({ collection: 'messages', data, overrideAccess: true })

    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const to = settings.contact?.notifyEmail
    if (to) {
      const rows = Object.entries({ Name: name, Email: email, Phone: data.phone, Ward: data.ward, Topic: data.topic })
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escapeHtml(v)}</td></tr>`)
        .join('')
      await payload
        .sendEmail({
          to,
          replyTo: email,
          subject: `New website message: ${data.topic} from ${name}`,
          html: `<table>${rows}</table><p style="white-space:pre-wrap">${escapeHtml(message)}</p><p>View and manage it in the admin Inbox.</p>`,
        })
        .catch((err: unknown) => payload.logger.error({ err }, 'Contact form email failed'))
    }
    return { ok: true }
  } catch (err) {
    ;(await getClient()).logger.error({ err }, 'Contact form submission failed')
    return { ok: false, error: 'Sorry, something went wrong. Please email or call the office.' }
  }
}

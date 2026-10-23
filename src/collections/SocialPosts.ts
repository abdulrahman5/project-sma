import { type CollectionConfig, ValidationError } from 'payload'

import { isEditor } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { fetchXPost, parseXUrl } from '../lib/social/x'

export const PLATFORMS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'X (Twitter)', value: 'x' },
] as const

export type Platform = (typeof PLATFORMS)[number]['value']
export const platformLabel = (p: string) => (p === 'x' ? 'X' : (PLATFORMS.find((x) => x.value === p)?.label ?? p))

const https = (v: unknown) => (!v || /^https:\/\/\S+$/i.test(String(v)) ? true : 'Enter the full link, starting with https://')

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  labels: { singular: 'Social post', plural: 'Social posts' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'platform', 'postedAt', 'hidden', 'source'],
    description:
      'Shown in the News section alongside press releases. Facebook and Instagram posts are imported automatically; ' +
      'to add an X post, click "Create new" and paste its link. Tick "Hide from website" to remove a post from the site.',
    components: {
      beforeListTable: ['@/components/admin/SocialSyncPanel#SocialSyncPanel'],
    },
  },
  defaultSort: '-postedAt',
  access: {
    read: ({ req }) => (req.user ? true : { hidden: { not_equals: true } }),
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (!data || req.context?.socialImport) return data

        // Manually added posts (X, or a Facebook/Instagram post pasted by hand)
        if (operation === 'create') {
          data.source = 'manual'
          if (data.platform === 'x') {
            const parsed = parseXUrl(String(data.url ?? ''))
            if (!parsed) {
              throw new ValidationError({
                collection: 'social-posts',
                errors: [{ path: 'url', message: 'Paste the link to a single post, e.g. https://x.com/username/status/1234567890' }],
              })
            }
            data.url = parsed.url
            data.externalId = `x:${parsed.id}`
            if (!data.text) {
              const fetched = await fetchXPost(parsed.url).catch(() => null)
              if (fetched?.text) data.text = fetched.text
              if (fetched?.postedAt && !data.postedAt) data.postedAt = fetched.postedAt
            }
          } else if (data.url) {
            data.externalId = `${data.platform}:${data.url}`
          }
          if (!data.text && !data.image) {
            throw new ValidationError({
              collection: 'social-posts',
              errors: [{ path: 'text', message: "Couldn't fetch the post automatically. Please paste the post's text (and optionally a photo)." }],
            })
          }
        }

        const label = platformLabel(String(data.platform ?? ''))
        const snippet = String(data.text ?? '').replace(/\s+/g, ' ').trim()
        data.title = `${label}: ${snippet.length > 70 ? `${snippet.slice(0, 70)}…` : snippet || 'photo'}`
        return data
      },
    ],
    afterChange: [revalidateAfterChange],
    afterDelete: [
      revalidateAfterDelete,
      // Remember deleted imported posts so the next sync doesn't bring them back.
      async ({ doc, req }) => {
        if (doc.source !== 'imported' || !doc.externalId) return
        const settings = await req.payload.findGlobal({ slug: 'social-settings', req })
        const ignored = new Set<string>(Array.isArray(settings.ignoredIds) ? (settings.ignoredIds as string[]) : [])
        ignored.add(doc.externalId)
        await req.payload.updateGlobal({ slug: 'social-settings', data: { ignoredIds: [...ignored] }, req })
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } },
    {
      type: 'row',
      fields: [
        { name: 'platform', type: 'select', required: true, defaultValue: 'x', options: [...PLATFORMS] },
        {
          name: 'url',
          label: 'Link to the post',
          type: 'text',
          required: true,
          validate: https,
          admin: { description: 'For X, paste the post link and save — the text is fetched automatically.' },
        },
      ],
    },
    { name: 'text', type: 'textarea', admin: { description: 'Filled in automatically for imported posts.' } },
    { name: 'image', label: 'Photo', type: 'upload', relationTo: 'media' },
    {
      name: 'postedAt',
      label: 'Posted on',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'hidden',
      label: 'Hide from website',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Imported automatically', value: 'imported' },
        { label: 'Added manually', value: 'manual' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'externalId', type: 'text', unique: true, index: true, admin: { hidden: true } },
  ],
}

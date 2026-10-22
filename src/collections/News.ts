import type { CollectionConfig, FieldHook } from 'payload'

import { canWriteContent, isEditor, publishedOrLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)

const formatSlug: FieldHook = ({ value, data }) => {
  if (typeof value === 'string' && value.trim()) return slugify(value)
  return data?.title ? slugify(String(data.title)) : value
}

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News post', plural: 'News & press' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', '_status', 'updatedAt'],
    description: 'Press releases and updates. Save as draft to keep a post hidden until it is ready.',
  },
  defaultSort: '-publishedDate',
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: publishedOrLoggedIn,
    create: canWriteContent,
    update: canWriteContent,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Headline', type: 'text', required: true },
    { name: 'summary', type: 'textarea', required: true, admin: { description: 'One or two sentences shown on news cards and in link previews.' } },
    { name: 'image', label: 'Cover photo', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Full story', type: 'richText' },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Web address of the post. Filled in from the headline if left empty.' },
      hooks: { beforeValidate: [formatSlug] },
    },
    {
      name: 'publishedDate',
      label: 'Date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}

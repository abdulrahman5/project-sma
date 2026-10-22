import type { GlobalConfig } from 'payload'

import { anyone, isEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About & timeline',
  admin: { group: 'Website' },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'image', label: 'Photo', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Biography', type: 'richText' },
    {
      name: 'facts',
      label: 'Quick facts',
      type: 'array',
      maxRows: 6,
      fields: [{ type: 'row', fields: [{ name: 'label', type: 'text', required: true }, { name: 'value', type: 'text', required: true }] }],
    },
    {
      name: 'timeline',
      label: 'Milestones',
      type: 'array',
      fields: [
        { type: 'row', fields: [{ name: 'year', type: 'text', required: true, admin: { width: '25%' } }, { name: 'title', type: 'text', required: true }] },
        { name: 'text', label: 'Description', type: 'textarea' },
      ],
    },
  ],
}

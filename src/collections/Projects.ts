import type { CollectionConfig } from 'payload'

import { canWriteContent, isEditor, publishedOrLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const PROJECT_CATEGORIES = ['Education', 'Health', 'Infrastructure', 'Empowerment', 'Agriculture', 'Water', 'Security', 'Other']

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'year', '_status', 'order'],
    description: 'Constituency projects shown in the Impact section of the home page.',
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 20 },
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
    { name: 'title', label: 'Project name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'select', required: true, options: PROJECT_CATEGORIES },
        { name: 'location', type: 'text' },
        { name: 'year', type: 'text' },
      ],
    },
    { name: 'summary', label: 'Short description', type: 'textarea', required: true },
    { name: 'image', label: 'Photo', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      label: 'Display order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}

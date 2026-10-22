import type { CollectionConfig } from 'payload'

import { anyone, isEditor, isLoggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Photo library' },
  admin: {
    group: 'Website',
    description: 'All uploaded photos. Large photos are resized automatically.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isEditor,
  },
  upload: {
    // SVG is deliberately excluded: it can carry scripts.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 900 },
      { name: 'large', width: 1600 },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
      admin: { description: 'Briefly describe the photo (used by screen readers and search engines).' },
    },
  ],
}

import type { GlobalConfig } from 'payload'

import { anyone, isEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { ICON_NAMES } from '../lib/icons'

export const Agenda: GlobalConfig = {
  slug: 'agenda',
  label: 'Agenda / priorities',
  admin: { group: 'Website' },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea' },
    {
      name: 'items',
      label: 'Priorities',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'icon', type: 'select', required: true, defaultValue: 'community', options: ICON_NAMES, admin: { width: '30%' } },
            { name: 'title', type: 'text', required: true },
          ],
        },
        { name: 'text', label: 'Description', type: 'textarea', required: true },
      ],
    },
  ],
}

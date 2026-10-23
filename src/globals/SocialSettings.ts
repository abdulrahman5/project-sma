import type { GlobalConfig } from 'payload'

import { isEditor, isLoggedIn } from '../access'

export const SocialSettings: GlobalConfig = {
  slug: 'social-settings',
  label: 'Social media sync',
  admin: {
    group: 'Administration',
    description:
      'Facebook and Instagram posts are imported automatically once a day, or when you click "Sync now" on the Social posts page. ' +
      'The connection itself (Page ID and access token) is configured by the site administrator in Vercel.',
  },
  access: { read: isLoggedIn, update: isEditor },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'importFacebook', label: 'Import Facebook Page posts', type: 'checkbox', defaultValue: true },
        { name: 'importInstagram', label: 'Import Instagram posts', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'lastSyncAt', label: 'Last sync', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'lastSyncSummary', label: 'Last sync result', type: 'textarea', admin: { readOnly: true } },
    // Imported posts that an admin deleted; the sync skips these.
    { name: 'ignoredIds', type: 'json', admin: { hidden: true } },
  ],
}

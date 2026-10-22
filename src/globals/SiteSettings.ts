import type { GlobalConfig, TextFieldSingleValidation } from 'payload'

import { anyone, isEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

const hexColour: TextFieldSingleValidation = (value) =>
  !value || /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? true : 'Use a hex colour code such as #0b5d3b'

const url: TextFieldSingleValidation = (value) =>
  !value || /^https:\/\/\S+$/i.test(value) ? true : 'Enter a full link starting with https://'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Website' },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'name', label: 'Full name / title', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'shortName', label: 'Short name (logo)', type: 'text', required: true, admin: { description: 'e.g. SMA' } },
                { name: 'party', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'office', type: 'text' },
                { name: 'constituency', type: 'text' },
                { name: 'state', type: 'text' },
              ],
            },
            { name: 'seoDescription', label: 'Search engine description', type: 'textarea', admin: { description: 'Shown by Google and in link previews (about 155 characters).' } },
            { name: 'shareImage', label: 'Link preview image', type: 'upload', relationTo: 'media', admin: { description: 'Shown when the site is shared on WhatsApp, Facebook, X, etc. Ideal size 1200×630. Defaults to the portrait.' } },
          ],
        },
        {
          label: 'Brand colours',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'primaryColor', label: 'Primary colour', type: 'text', defaultValue: '#0b5d3b', validate: hexColour, admin: { description: 'Main colour: header, banners, buttons.' } },
                { name: 'accentColor', label: 'Accent colour', type: 'text', defaultValue: '#c8a13a', validate: hexColour, admin: { description: 'Highlights and secondary buttons.' } },
              ],
            },
          ],
        },
        {
          label: 'Home banner',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                { name: 'badge', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'headline', type: 'text', required: true },
                    { name: 'highlight', label: 'Highlighted words', type: 'text', admin: { description: 'Shown after the headline in the accent colour.' } },
                  ],
                },
                { name: 'intro', type: 'textarea' },
                { name: 'image', label: 'Portrait photo', type: 'upload', relationTo: 'media', admin: { description: 'Portrait orientation (4:5) works best.' } },
              ],
            },
            {
              name: 'stats',
              label: 'Key numbers',
              type: 'array',
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', label: 'Number', type: 'text', required: true },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
              ],
            },
            { name: 'quote', label: 'Signature quote', type: 'textarea', admin: { description: 'Leave empty to hide the quote section.' } },
          ],
        },
        {
          label: 'Contact & social',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                { name: 'address', label: 'Office address', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'email', label: 'Public email', type: 'text' },
                    { name: 'phone', label: 'Phone / WhatsApp', type: 'text' },
                  ],
                },
                {
                  name: 'notifyEmail',
                  label: 'Send contact-form alerts to',
                  type: 'email',
                  admin: { description: 'Each new website message is emailed here (and always saved in the Inbox).' },
                },
              ],
            },
            {
              name: 'socials',
              label: 'Social media links',
              type: 'group',
              admin: { description: 'Leave a field empty to hide that icon.' },
              fields: [
                { type: 'row', fields: [
                  { name: 'facebook', type: 'text', validate: url },
                  { name: 'x', label: 'X / Twitter', type: 'text', validate: url },
                  { name: 'instagram', type: 'text', validate: url },
                ] },
                { type: 'row', fields: [
                  { name: 'youtube', label: 'YouTube', type: 'text', validate: url },
                  { name: 'tiktok', label: 'TikTok', type: 'text', validate: url },
                ] },
              ],
            },
          ],
        },
      ],
    },
  ],
}

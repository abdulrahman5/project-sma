import type { CollectionConfig } from 'payload'

import { hasRole, isEditor, isSuperAdmin } from '../access'

export const MESSAGE_TOPICS = ['Volunteer', 'Request support', 'Invite to event', 'Share feedback', 'Media enquiry']

const CSV_COLUMNS = ['createdAt', 'name', 'email', 'phone', 'ward', 'topic', 'status', 'message', 'notes'] as const

// Quote every cell, and neutralise values that spreadsheet apps would run as formulas.
const csvCell = (v: unknown) => {
  const s = String(v ?? '')
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Inbox' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'topic', 'ward', 'status', 'createdAt'],
    description: 'Messages sent through the website contact form.',
    components: {
      beforeListTable: ['@/components/admin/ExportMessagesButton#ExportMessagesButton'],
    },
  },
  defaultSort: '-createdAt',
  access: {
    // Messages are only created by the website's contact form (server-side), never through the API.
    create: () => false,
    read: isEditor,
    update: isEditor,
    delete: isSuperAdmin,
  },
  endpoints: [
    {
      path: '/export-csv',
      method: 'get',
      handler: async (req) => {
        if (!hasRole(req, 'superadmin', 'editor')) {
          return Response.json({ error: 'Not allowed' }, { status: 403 })
        }
        const { docs } = await req.payload.find({
          collection: 'messages',
          pagination: false,
          sort: '-createdAt',
          req,
          overrideAccess: false,
        })
        const rows = [CSV_COLUMNS.join(','), ...docs.map((d) => CSV_COLUMNS.map((c) => csvCell(d[c])).join(','))]
        const date = new Date().toISOString().slice(0, 10)
        return new Response('﻿' + rows.join('\r\n'), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="sma-messages-${date}.csv"`,
          },
        })
      },
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { readOnly: true } },
        { name: 'ward', label: 'Ward / community', type: 'text', admin: { readOnly: true } },
        { name: 'topic', type: 'select', options: MESSAGE_TOPICS, admin: { readOnly: true } },
      ],
    },
    { name: 'message', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Handled', value: 'handled' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', label: 'Internal notes', type: 'textarea', admin: { position: 'sidebar', description: 'Only visible to admins.' } },
  ],
}

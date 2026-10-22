import { type CollectionConfig, ValidationError } from 'payload'

import { hasRole, isSuperAdmin, isSuperAdminField, ROLES } from '../access'

const MIN_PASSWORD_LENGTH = 10

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin user', plural: 'Admin users' },
  admin: {
    group: 'Administration',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    description: 'People who can log in to this admin panel. Only Super Admins can add or remove users.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // log out after 8 hours
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // lock the account for 15 minutes after 5 failed attempts
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => (hasRole(req, 'superadmin') ? true : { id: { equals: req.user?.id } }),
    create: isSuperAdmin,
    update: ({ req }) => (hasRole(req, 'superadmin') ? true : { id: { equals: req.user?.id } }),
    // Super Admins can remove other accounts, but never their own.
    delete: ({ req }) => (hasRole(req, 'superadmin') ? { id: { not_equals: req.user!.id } } : false),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.password && String(data.password).length < MIN_PASSWORD_LENGTH) {
          throw new ValidationError({
            collection: 'users',
            errors: [{ path: 'password', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` }],
          })
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [...ROLES],
      saveToJWT: true,
      admin: {
        position: 'sidebar',
        description: 'Super Admin: everything, including users. Editor: all content and the inbox. Contributor: drafts only.',
      },
      access: { create: isSuperAdminField, update: isSuperAdminField },
      hooks: {
        beforeChange: [
          // The very first account (created on the "Create first user" screen) becomes the Super Admin.
          async ({ req, operation, value }) => {
            if (operation !== 'create') return value
            const { totalDocs } = await req.payload.count({ collection: 'users', req })
            return totalDocs === 0 ? 'superadmin' : value
          },
        ],
      },
    },
  ],
}

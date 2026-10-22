import type { Access, FieldAccess, PayloadRequest } from 'payload'

// Roles
//  superadmin  – everything, including managing admin accounts
//  editor      – all content, settings and the inbox
//  contributor – can write and edit drafts, but cannot publish, delete, or see the inbox
export const ROLES = [
  { label: 'Super Admin', value: 'superadmin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Contributor', value: 'contributor' },
] as const

export type Role = (typeof ROLES)[number]['value']

const roleOf = (req: PayloadRequest): Role | undefined => (req.user as { role?: Role } | null)?.role

export const hasRole = (req: PayloadRequest, ...roles: Role[]) => {
  const role = roleOf(req)
  return Boolean(role && roles.includes(role))
}

export const isSuperAdmin: Access = ({ req }) => hasRole(req, 'superadmin')
export const isSuperAdminField: FieldAccess = ({ req }) => hasRole(req, 'superadmin')
export const isEditor: Access = ({ req }) => hasRole(req, 'superadmin', 'editor')
export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const anyone: Access = () => true

// Public visitors only see published documents; logged-in admins see drafts too.
export const publishedOrLoggedIn: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

// Editors can publish. Contributors can only save drafts.
export const canWriteContent: Access = ({ req, data }) => {
  if (hasRole(req, 'superadmin', 'editor')) return true
  if (hasRole(req, 'contributor')) return data?._status !== 'published'
  return false
}

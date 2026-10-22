import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'

// The public site is pre-rendered. Any content change purges the cache so updates show up immediately.
// The site is small, so the whole site is refreshed rather than tracking individual pages.
const refresh = (req: PayloadRequest) => {
  if (req.context?.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch (err) {
    // Happens outside a Next.js request, e.g. when running the seed script.
    req.payload.logger.debug({ err }, 'Skipped revalidation')
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  refresh(req)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  refresh(req)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  refresh(req)
  return doc
}

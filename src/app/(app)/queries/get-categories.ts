'use server'

import { payload } from '../(client)/payload-client'

const AUTRE_CATEGORY_NAME = 'Autre'

/**
 * Ensures a real Payload category exists for "Autre" (same as other genres).
 * Idempotent; safe to call on each getCategories.
 */
async function ensureAutreCategoryExists(): Promise<void> {
  const found = await payload.find({
    collection: 'categories',
    where: { name: { equals: AUTRE_CATEGORY_NAME } },
    limit: 1,
  })
  if (found.docs.length > 0) {
    return
  }
  try {
    await payload.create({
      collection: 'categories',
      data: { name: AUTRE_CATEGORY_NAME },
      overrideAccess: true,
    })
  } catch {
    // Concurrent create or unique constraint — category likely exists now
  }
}

export async function getCategories() {
  await ensureAutreCategoryExists()
  const categories = await payload.find({
    collection: 'categories',
    sort: 'name',
    limit: 500,
  })
  return categories.docs
}

'use server'

import { payload } from '../../payload-client'

export async function getCategories() {
  const categories = await payload.find({ collection: 'categories' })
  return categories.docs
}

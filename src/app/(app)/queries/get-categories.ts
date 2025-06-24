'use server'

import { payload } from '../(client)/payload-client'

export async function getCategories() {
  const categories = await payload.find({ collection: 'categories' })
  return categories.docs
}

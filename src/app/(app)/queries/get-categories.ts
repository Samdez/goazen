'use server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getCategories() {
  const payload = await getPayload({ config })
  const categories = await payload.find({ collection: 'categories' })
  return categories.docs
}

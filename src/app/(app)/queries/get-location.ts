'use server'
import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

async function _getLocation(slug: string) {
  const location = await payload.find({
    collection: 'locations',
    where: { slug: { equals: slug } },
  })
  return location.docs[0]
}

export async function getLocation(slug: string) {
  return unstable_cache(async () => await _getLocation(slug), ['location', slug], {
    tags: ['locations'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

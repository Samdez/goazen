'use server'

import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

export async function getCities(region?: string) {
  return unstable_cache(
    async () => {
      const cities = await payload.find({
        collection: 'cities',
        sort: 'name',
        limit: 100,
        where: { ...(region ? { region: { equals: region } } : {}) },
      })
      return cities
    },
    ['cities', region || ''],
    { tags: ['cities'], revalidate: 60 * 60 * 24 },
  )()
}

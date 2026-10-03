'use server'

import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

// Révalidé par le hook de la collection Cities (tag `cities`).
export async function getCity(slug: string) {
  return unstable_cache(
    async () => {
      const city = await payload.find({ collection: 'cities', where: { slug: { equals: slug } } })
      return city.docs[0]
    },
    ['city', slug],
    { tags: ['cities'], revalidate: false },
  )()
}

'use server'

import { payload } from '../(client)/payload-client'

export async function getCity(slug: string) {
  const city = await payload.find({ collection: 'cities', where: { slug: { equals: slug } } })
  return city.docs[0]
}

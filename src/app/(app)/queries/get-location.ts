'use server'
import { payload } from '../client/payload-client'

export async function getLocation(slug: string) {
  const location = await payload.find({
    collection: 'locations',
    where: { slug: { equals: slug } },
  })
  return location.docs[0]
}

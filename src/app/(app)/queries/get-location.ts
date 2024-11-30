'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getLocation(slug: string) {
  const payload = await getPayload({ config })
  const location = await payload.find({
    collection: 'locations',
    where: { slug: { equals: slug } },
  })
  return location.docs[0]
}

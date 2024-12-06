'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getLocations(cityName?: string) {
  const payload = await getPayload({ config })
  const locations = await payload.find({
    collection: 'locations',
    sort: 'name',
    limit: 1000,
    where: {
      ...(cityName ? { city: { equals: cityName } } : {}),
    },
  })
  return locations
}

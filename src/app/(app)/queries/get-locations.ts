'use server'
import { payload } from '../client/payload-client'

export async function getLocations(cityName?: string) {
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

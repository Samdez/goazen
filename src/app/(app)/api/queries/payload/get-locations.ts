'use server'
import { slugifyString } from '@/utils'
import { payload } from '../../payload-client'

export async function getLocations({
  cityName,
  page = 1,
  limit = 10,
}: {
  cityName?: string
  page?: number
  limit?: number
}) {
  const locations = await payload.find({
    collection: 'locations',
    sort: 'name',
    limit,
    where: {
      ...(cityName ? { city: { equals: slugifyString(cityName) } } : {}),
    },
    page,
  })
  return locations
}

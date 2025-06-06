'use server'
import { slugifyString } from '@/utils'
import { payload } from '../client/payload-client'

export async function getLocations({
  cityName,
  page = 1,
  limit = 100,
}: {
  cityName: string
  page?: number
  limit?: number
}) {
  const locations = await payload.find({
    collection: 'locations',
    sort: 'name',
    limit,
    where: { 'city V2.slug': { equals: slugifyString(cityName) } },
    page,
  })
  return locations
}

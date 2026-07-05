'use server'
import { unstable_cache } from 'next/cache'
import { slugifyString } from '@/utils'
import { payload } from '../(client)/payload-client'

type GetLocationsParams = {
  cityName?: string
  page?: number
  limit?: number
}

export type LocationOption = {
  id: string
  name: string
}

async function _getLocations({ cityName, page = 1, limit = 100 }: GetLocationsParams) {
  const locations = await payload.find({
    collection: 'locations',
    sort: 'name',
    limit,
    where: cityName ? { 'city V2.slug': { equals: slugifyString(cityName) } } : {},
    page,
  })
  return locations
}

export async function getLocations(params: GetLocationsParams) {
  const cacheKey = JSON.stringify({
    cityName: params.cityName || '',
    page: params.page || 1,
    limit: params.limit || 100,
  })

  return unstable_cache(async () => await _getLocations(params), ['locations', cacheKey], {
    tags: ['locations'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

// Slim variant for the event submission form: the full docs at limit 1000
// exceed unstable_cache's 2MB entry limit.
export async function getLocationOptions(): Promise<LocationOption[]> {
  return unstable_cache(
    async () => {
      const locations = await payload.find({
        collection: 'locations',
        sort: 'name',
        limit: 1000,
        depth: 0,
        select: { name: true },
      })
      return locations.docs.map(({ id, name }) => ({ id, name }))
    },
    ['location-options'],
    {
      tags: ['locations'],
      revalidate: 60 * 60 * 24, // 24 hours
    },
  )()
}

// Slim variant for the sitemap, same 2MB constraint as above.
export async function getLocationsForSitemap() {
  return unstable_cache(
    async () => {
      const locations = await payload.find({
        collection: 'locations',
        limit: 1000,
        depth: 1,
        select: { slug: true, updatedAt: true, 'city V2': true },
      })
      return locations.docs
    },
    ['locations-sitemap'],
    {
      tags: ['locations'],
      revalidate: 60 * 60 * 24, // 24 hours
    },
  )()
}

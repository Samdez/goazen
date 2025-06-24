'use server'

import { payload } from '../client/payload-client'

export async function getCities(region?: string) {
  const cities = await payload.find({
    collection: 'cities',
    sort: 'name',
    limit: 100,
    where: { ...(region ? { region: { equals: region } } : {}) },
  })
  return cities
}

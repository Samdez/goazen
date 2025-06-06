'use server'

import { payload } from '../client/payload-client'

export async function getCities() {
  const cities = await payload.find({ collection: 'cities', sort: 'name', limit: 100 })
  return cities.docs
}

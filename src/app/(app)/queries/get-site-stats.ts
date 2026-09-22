'use server'

import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

export type SiteStats = {
  publishedEvents: number
  upcomingEvents: number
  locations: number
  cities: number
}

/**
 * Les chiffres du site, pour les pages qui doivent prouver qu'il est vivant.
 *
 * `limit: 0` ne ramène aucun document : seul `totalDocs` nous intéresse, et le
 * compte se fait côté Mongo.
 */
async function _getSiteStats(): Promise<SiteStats> {
  const [published, upcoming, locations, cities] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { _status: { equals: 'published' } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'events',
      where: {
        and: [{ _status: { equals: 'published' } }, { date: { greater_than_equal: new Date() } }],
      },
      limit: 0,
      depth: 0,
    }),
    payload.find({ collection: 'locations', limit: 0, depth: 0 }),
    payload.find({ collection: 'cities', limit: 0, depth: 0 }),
  ])

  return {
    publishedEvents: published.totalDocs,
    upcomingEvents: upcoming.totalDocs,
    locations: locations.totalDocs,
    cities: cities.totalDocs,
  }
}

export async function getSiteStats(): Promise<SiteStats> {
  return unstable_cache(async () => await _getSiteStats(), ['site-stats'], {
    tags: ['events'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

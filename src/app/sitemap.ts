import type { MetadataRoute } from 'next'
import { getLocations } from './(app)/queries/get-locations'
import { buildEventUrl, getLocationInfo } from '@/utils'
import { getCachedEvents } from './(app)/queries/get-events'
import { REGIONS } from './(app)/constants'
import { getCities } from './(app)/queries/get-cities'
import { getSpecialEvents } from './(app)/queries/get-special-events'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getCachedEvents({ limit: 1000, startDate: new Date().toISOString() })
  const cities = await getCities()
  const specialEvents = await getSpecialEvents()

  const regionsUrls = REGIONS.map((region) => ({
    url: `https://goazen.info/concerts/${region}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const citiesUrls = cities.docs.map((city) => ({
    url: `https://goazen.info/concerts/${city.region}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }))

  const eventsUrls = events.docs
    .map((event) => {
      const eventUrl = buildEventUrl(event)
      if (!eventUrl) return undefined
      return {
        url: `https://goazen.info${eventUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.5,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== undefined)

  const specialEventsUrls = specialEvents.docs.map((event) => ({
    url: `https://goazen.info/concerts/evenements/${event.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }))

  const locations = await getLocations({ limit: 1000 })
  const locationsUrls = locations.docs
    .map((location) => {
      const region = typeof location['city V2'] !== 'string' && location['city V2']?.region
      const citySlug = typeof location['city V2'] !== 'string' && location['city V2']?.slug
      if (!region || !citySlug) return undefined
      return {
        url: `https://goazen.info/concerts/${region}/${citySlug}/${location.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== undefined)

  return [
    {
      url: 'https://goazen.info',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...specialEventsUrls,
    ...regionsUrls,
    ...citiesUrls,
    ...locationsUrls,
    ...eventsUrls,
  ]
}

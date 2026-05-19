import type { MetadataRoute } from 'next'
import { getLocations } from './(app)/queries/get-locations'
import { buildEventUrl } from '@/utils'
import { getCachedEvents } from './(app)/queries/get-events'
import { REGIONS } from './(app)/constants'
import { getCities } from './(app)/queries/get-cities'
import { getSpecialEvents } from './(app)/queries/get-special-events'

function toDate(value: string | Date | undefined): Date {
  if (!value) return new Date(0)
  return value instanceof Date ? value : new Date(value)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getCachedEvents({ limit: 1000, startDate: new Date().toISOString() })
  const cities = await getCities()
  const specialEvents = await getSpecialEvents()
  const locations = await getLocations({ limit: 1000 })

  const latestEventUpdate = events.docs.reduce<Date>((acc, e) => {
    const t = toDate(e.updatedAt)
    return t > acc ? t : acc
  }, new Date(0))

  const regionsUrls = REGIONS.map((region) => ({
    url: `https://goazen.info/concerts/${region}`,
    lastModified: latestEventUpdate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const citiesUrls = cities.docs.map((city) => ({
    url: `https://goazen.info/concerts/${city.region}/${city.slug}`,
    lastModified: toDate(city.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const eventsUrls = events.docs.map((event) => ({
    url: `https://goazen.info${buildEventUrl(event)}`,
    lastModified: toDate(event.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const specialEventsUrls = specialEvents.docs.map((event) => ({
    url: `https://goazen.info/concerts/evenement/${event.slug}`,
    lastModified: toDate(event.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const locationsUrls = locations.docs
    .map((location) => {
      const cityV2 = location['city V2']
      const region = typeof cityV2 !== 'string' ? cityV2?.region : undefined
      const citySlug = typeof cityV2 !== 'string' ? cityV2?.slug : undefined
      if (!region || !citySlug) return null
      return {
        url: `https://goazen.info/concerts/${region}/${citySlug}/${location.slug}`,
        lastModified: toDate(location.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)

  return [
    {
      url: 'https://goazen.info',
      lastModified: latestEventUpdate,
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

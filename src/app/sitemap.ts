import type { MetadataRoute } from 'next'
import { getLocations } from './(app)/queries/get-locations'
import { buildEventUrl } from '@/utils'
import { getCachedEvents } from './(app)/queries/get-events'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getCachedEvents({ limit: 1000, startDate: new Date().toISOString() })
  const eventsUrls = events.docs.map((event) => {
    const eventUrl = buildEventUrl(event)
    return {
      url: `https://goazen.info${eventUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  })

  const locations = await getLocations({ limit: 1000 })
  const locationsUrls = locations.docs.map((location) => {
    return {
      url: `https://goazen.info/concerts/${location.city}/${location.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }
  })

  return [
    {
      url: 'https://goazen.info',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://goazen.info/contact',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    ...eventsUrls,
    ...locationsUrls,
  ]
}

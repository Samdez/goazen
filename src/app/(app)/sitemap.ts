import type { MetadataRoute } from 'next'
import { getEvents } from './queries/get-events'
import { getLocations } from './queries/get-locations'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents({ limit: 1000, startDate: new Date().toISOString() })
  const eventsUrls = events.docs.map((event) => {
    if (!event.location) return
    const eventCity =
      typeof event.location !== 'string' && event.location?.city && event.location.city
    const eventSlug =
      typeof event.location !== 'string' && event.location?.slug && event.location.slug
    return {
      url: `https://goazen.info/concerts/${eventCity}/${eventSlug}/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  })

  const locations = await getLocations()
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
    ...eventsUrls.filter((url) => url !== undefined),
    ...locationsUrls,
  ]
}

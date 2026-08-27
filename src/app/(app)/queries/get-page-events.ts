'use server'

import { unstable_cache } from 'next/cache'
import type { Event } from '@/payload-types'
import { payload } from '../(client)/payload-client'

export type GetPageEventsParams = {
  cityId?: string
  genreId?: string
}

// Upcoming events for an SEO landing page scoped to a city and/or a genre.
// Mirrors the filtering shape of get-events.ts (payload local API, depth 2,
// published only) and shares the `events` cache tag so event edits revalidate it.
async function _getPageEvents({ cityId, genreId }: GetPageEventsParams): Promise<Event[]> {
  if (!cityId && !genreId) return []

  // "Upcoming" = today (Europe/Paris) onwards. get-events.ts rolls the start
  // back a day and pins it to 22:00 UTC to cover the whole current Paris day.
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1)
  startDate.setUTCHours(22, 0, 0, 0)

  // Legacy Location docs only have the `city` select (slugified name) set, with
  // `city V2` null - matching only on `city V2` would drop those events. Look up
  // the city slug so we can also match the legacy path, the way get-events.ts
  // keeps legacy-only locations visible for region filtering.
  let citySlug: string | undefined
  if (cityId) {
    const city = await payload.findByID({
      collection: 'cities',
      id: cityId,
      depth: 0,
      disableErrors: true,
    })
    citySlug = city?.slug ?? undefined
  }

  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        { date: { greater_than_equal: startDate } },
        ...(cityId
          ? [
              {
                or: [
                  { 'location.city V2': { equals: cityId } },
                  ...(citySlug ? [{ 'location.city': { equals: citySlug } }] : []),
                ],
              },
            ]
          : []),
        ...(genreId ? [{ category: { in: [genreId] } }] : []),
        { _status: { equals: 'published' } },
      ],
    },
    sort: 'date',
    limit: 6,
    draft: false,
    depth: 2,
  })

  // Deduplicate by ID (same guard get-events.ts applies).
  return Array.from(new Map(events.docs.map((event) => [event.id, event])).values())
}

export async function getPageEvents(params: GetPageEventsParams) {
  const cacheKey = JSON.stringify({
    cityId: params.cityId || '',
    genreId: params.genreId || '',
  })

  return unstable_cache(async () => await _getPageEvents(params), ['page-events', cacheKey], {
    tags: ['events'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

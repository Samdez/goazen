'use server'

import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

function extendEndDateToEndOfDay(date: string) {
  return new Date(new Date(date).setUTCHours(24, 0, 0, 0))
}

function extendEndDateToEndOfPreviousDay(date: string) {
  const yesterday = new Date(date)
  yesterday.setDate(new Date(date).getDate() - 1)

  return new Date(new Date(yesterday).setUTCHours(24, 0, 0, 0))
}

export type GetEventsParams = {
  startDate?: string
  endDate?: string
  page?: number
  category?: string
  locationId?: string
  limit?: number
  region?: string
  city?: string
  specialEvent?: string
  selectionOnly?: boolean
}

export async function _getEvents({
  startDate,
  endDate,
  page = 1,
  category,
  locationId,
  limit = 12,
  region,
  city,
  specialEvent,
  selectionOnly,
}: GetEventsParams) {
  const adjustedStartDate = startDate ? new Date(startDate) : new Date()
  adjustedStartDate.setDate(adjustedStartDate.getDate() - 1)
  adjustedStartDate.setUTCHours(22, 0, 0, 0)
  const extendedEndDate = endDate && extendEndDateToEndOfDay(endDate)

  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        ...(locationId ? [{ location: { equals: locationId } }] : []),
        ...(adjustedStartDate ? [{ date: { greater_than_equal: adjustedStartDate } }] : []),
        ...(extendedEndDate ? [{ date: { less_than_equal: extendedEndDate } }] : []),
        ...(category ? [{ 'category.slug': { equals: category } }] : []),
        ...(region ? [{ 'location.city V2.region': { equals: region } }] : []),
        ...(city
          ? [
              {
                or: [{ 'location.city V2.slug': { equals: city } }],
              },
            ]
          : []),
        ...(specialEvent ? [{ 'special_event.slug': { equals: specialEvent } }] : []),
        ...(selectionOnly ? [{ add_to_selection: { equals: true } }] : []),
        { _status: { equals: 'published' } },
      ],
    },
    sort: 'date',
    page,
    limit,
    draft: false,
    depth: 2,
  })

  // Deduplicate events by ID
  const uniqueEvents = {
    ...events,
    docs: Array.from(new Map(events.docs.map((event) => [event.id, event])).values()),
  }

  return uniqueEvents
}

export async function getCachedEvents(params: GetEventsParams) {
  const cacheKey = JSON.stringify({
    startDate: params.startDate || '',
    endDate: params.endDate || '',
    page: params.page || 1,
    category: params.category || '',
    locationId: params.locationId || '',
    limit: params.limit || 12,
    region: params.region || '',
    city: params.city || '',
    specialEvent: params.specialEvent || '',
    selectionOnly: params.selectionOnly || false,
  })

  return unstable_cache(async () => await _getEvents(params), ['events', cacheKey], {
    tags: ['events'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

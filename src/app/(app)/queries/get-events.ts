'use server'

import { unstable_cache } from 'next/cache'
import { payload } from '../client/payload-client'

function extendEndDateToEndOfDay(date: string) {
  return new Date(new Date(date).setUTCHours(24, 0, 0, 0))
}

function extendEndDateToEndOfPreviousDay(date: string) {
  const yesterday = new Date(date)
  yesterday.setDate(new Date(date).getDate() - 1)

  return new Date(new Date(yesterday).setUTCHours(24, 0, 0, 0))
}

export async function _getEvents({
  startDate,
  endDate,
  page,
  category,
  locationId,
  limit,
}: {
  startDate?: string
  endDate?: string
  page?: number
  category?: string
  locationId?: string
  limit?: number
}) {
  const extendedStartDate = startDate && extendEndDateToEndOfPreviousDay(startDate)
  const extendedEndDate = endDate && extendEndDateToEndOfDay(endDate)

  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        ...(locationId ? [{ location: { equals: locationId } }] : []),
        ...(extendedStartDate ? [{ date: { greater_than: extendedStartDate } }] : []),
        ...(extendedEndDate ? [{ date: { less_than: extendedEndDate } }] : []),
        ...(category ? [{ 'category.slug': { equals: category } }] : []),
        { _status: { equals: 'published' } },
      ],
    },
    sort: 'date',
    page,
    limit,
    draft: false,
  })

  return events
}

export async function getCachedEvents({
  startDate,
  endDate,
  page,
  category,
  locationId,
  limit,
}: {
  startDate?: string
  endDate?: string
  page?: number
  category?: string
  locationId?: string
  limit?: number
}) {
  return unstable_cache(
    async () => await _getEvents({ startDate, endDate, page, category, locationId, limit }),
    [
      startDate || '',
      endDate || '',
      page?.toString() || '',
      category || '',
      locationId || '',
      limit?.toString() || '',
    ],
    {
      tags: ['events'],
      revalidate: 60 * 60 * 24,
    },
  )()
}

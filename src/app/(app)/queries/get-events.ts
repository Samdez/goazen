'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

function extendEndDateToEndOfDay(date: string) {
  return new Date(new Date(date).setUTCHours(24, 0, 0, 0))
}

function extendEndDateToEndOfPreviousDay(date: string) {
  const yesterday = new Date(date)
  yesterday.setDate(new Date(date).getDate() - 1)

  return new Date(new Date(yesterday).setUTCHours(24, 0, 0, 0))
}

export async function getEvents({
  startDate,
  endDate,
  page,
  locationId,
  limit = 100,
}: {
  startDate?: string
  endDate?: string
  page?: number
  locationId?: string
  limit?: number
}) {
  const extendedStartDate = startDate && extendEndDateToEndOfPreviousDay(startDate)
  const extendedEndDate = endDate && extendEndDateToEndOfDay(endDate)
  const payload = await getPayload({ config })

  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        ...(locationId ? [{ location: { equals: locationId } }] : []),
        ...(extendedStartDate ? [{ date: { greater_than: extendedStartDate } }] : []),
        ...(extendedEndDate ? [{ date: { less_than: extendedEndDate } }] : []),
      ],
    },
    limit,
    sort: 'date',
    page,
  })

  return events
}

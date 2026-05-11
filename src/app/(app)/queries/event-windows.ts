'use server'

import type { Where } from 'payload'
import type { Event, SpecialEvent } from '@/payload-types'
import { payload } from '../(client)/payload-client'

type Region = 'pays-basque' | 'landes'

interface WindowOpts {
  region?: Region
  free?: boolean
  limit?: number
}

function regionFilter(region?: Region): Where[] {
  if (!region) return []
  return [
    {
      or: [{ 'location.city V2.region': { equals: region } }, { region: { equals: region } }],
    },
  ]
}

function freeFilter(free?: boolean): Where[] {
  if (!free) return []
  return [{ or: [{ price: { equals: '0' } }, { price: { equals: 'Gratuit' } }] }]
}

/**
 * "Ce soir" window — events whose start is between now (Paris) and tomorrow 06:00 (Paris).
 * Implemented in UTC by approximating Paris offset; downstream `isTonight` re-validates per event.
 */
export async function getEventsTonight(opts: WindowOpts = {}): Promise<Event[]> {
  const now = new Date()
  const tomorrow6Paris = new Date(now)
  tomorrow6Paris.setUTCHours(tomorrow6Paris.getUTCHours() + 24)
  // 06:00 Paris ≈ 04:00 UTC (summer) or 05:00 UTC (winter). Use 06:00 UTC as safe upper bound.
  tomorrow6Paris.setUTCHours(6, 0, 0, 0)

  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { date: { greater_than_equal: now.toISOString() } },
        { date: { less_than: tomorrow6Paris.toISOString() } },
        ...regionFilter(opts.region),
        ...freeFilter(opts.free),
      ],
    },
    sort: 'date',
    limit: opts.limit ?? 12,
    depth: 2,
    draft: false,
  })
  return res.docs
}

/**
 * "Cette semaine" — events from tomorrow 06:00 (Paris) to next Sunday 23:59 (Paris).
 */
export async function getEventsThisWeek(opts: WindowOpts = {}): Promise<Event[]> {
  const now = new Date()

  const start = new Date(now)
  start.setUTCHours(start.getUTCHours() + 24)
  start.setUTCHours(6, 0, 0, 0) // tomorrow 06:00 UTC

  // upcoming Sunday end-of-day Paris (~22:00 UTC)
  const end = new Date(now)
  const dow = end.getUTCDay() // 0=Sun
  const daysUntilSunday = (7 - dow) % 7 || 7
  end.setUTCDate(end.getUTCDate() + daysUntilSunday)
  end.setUTCHours(22, 0, 0, 0)

  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { date: { greater_than_equal: start.toISOString() } },
        { date: { less_than_equal: end.toISOString() } },
        ...regionFilter(opts.region),
        ...freeFilter(opts.free),
      ],
    },
    sort: 'date',
    limit: opts.limit ?? 12,
    depth: 2,
    draft: false,
  })
  return res.docs
}

/**
 * "À venir" — events after this Sunday up to +90 days.
 */
export async function getEventsUpcoming(opts: WindowOpts = {}): Promise<Event[]> {
  const now = new Date()
  const start = new Date(now)
  const dow = start.getUTCDay()
  const daysUntilMonday = (1 - dow + 7) % 7 || 7
  start.setUTCDate(start.getUTCDate() + daysUntilMonday)
  start.setUTCHours(6, 0, 0, 0)

  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 90)

  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { date: { greater_than_equal: start.toISOString() } },
        { date: { less_than: end.toISOString() } },
        ...regionFilter(opts.region),
        ...freeFilter(opts.free),
      ],
    },
    sort: 'date',
    limit: opts.limit ?? 6,
    depth: 2,
    draft: false,
  })
  return res.docs
}

/**
 * Pick the active featured festival (start_date ≤ now+7d AND end_date ≥ now), if any.
 */
export async function getFeaturedFestival(): Promise<SpecialEvent | null> {
  const now = new Date()
  const horizon = new Date(now)
  horizon.setUTCDate(horizon.getUTCDate() + 7)

  const res = await payload.find({
    collection: 'special-events',
    where: {
      and: [
        { featured: { equals: true } },
        { start_date: { less_than_equal: horizon.toISOString() } },
        { end_date: { greater_than_equal: now.toISOString() } },
      ],
    },
    sort: 'start_date',
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
}

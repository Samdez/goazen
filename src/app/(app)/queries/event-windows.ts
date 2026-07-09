'use server'

import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'
import type { Event, SpecialEvent } from '@/payload-types'
import { payload } from '../(client)/payload-client'
import {
  tonightBounds,
  thisWeekBounds,
  weekendBounds,
  upcomingBounds,
  commonFilters,
  type WindowBounds,
  type WindowOpts,
} from './window-bounds'

// Bounds are day-granular (see window-bounds.ts), so cache keys stay stable
// within a day and roll over naturally at the window boundaries.
async function findInWindow(bounds: WindowBounds, opts: WindowOpts): Promise<Event[]> {
  const cacheKey = JSON.stringify({
    start: bounds.start.toISOString(),
    end: bounds.end.toISOString(),
    region: opts.region || '',
    city: opts.city || '',
    genres: opts.genres || [],
    limit: opts.limit ?? 12,
  })

  return unstable_cache(
    async () => {
      const res = await payload.find({
        collection: 'events',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { date: { greater_than_equal: bounds.start.toISOString() } },
            { date: { less_than: bounds.end.toISOString() } },
            ...commonFilters(opts),
          ],
        },
        sort: 'date',
        limit: opts.limit ?? 12,
        depth: 2,
        draft: false,
      })
      return res.docs
    },
    ['event-window', cacheKey],
    { tags: ['events'], revalidate: 60 * 60 * 24 },
  )()
}

export async function getEventsTonight(opts: WindowOpts = {}): Promise<Event[]> {
  return findInWindow(tonightBounds(), opts)
}

export async function getEventsThisWeek(opts: WindowOpts = {}): Promise<Event[]> {
  return findInWindow(thisWeekBounds(), opts)
}

export async function getEventsWeekend(opts: WindowOpts = {}): Promise<Event[]> {
  return findInWindow(weekendBounds(), opts)
}

export async function getEventsUpcoming(opts: WindowOpts = {}): Promise<Event[]> {
  return findInWindow(upcomingBounds(), { ...opts, limit: opts.limit ?? 6 })
}

export async function getFeaturedFestival(bounds?: WindowBounds): Promise<SpecialEvent | null> {
  // Default bounds are rounded to UTC midnight so the cache key is stable
  // within a day instead of unique per request.
  const start =
    bounds?.start ??
    (() => {
      const s = new Date()
      s.setUTCHours(0, 0, 0, 0)
      return s
    })()
  const end =
    bounds?.end ??
    (() => {
      const h = new Date(start)
      h.setUTCDate(h.getUTCDate() + 7)
      return h
    })()

  return unstable_cache(
    async () => {
      const res = await payload.find({
        collection: 'special-events',
        where: {
          and: [
            { featured: { equals: true } },
            { start_date: { less_than_equal: end.toISOString() } },
            { end_date: { greater_than_equal: start.toISOString() } },
          ],
        },
        sort: 'start_date',
        limit: 1,
        depth: 2,
      })
      return res.docs[0] ?? null
    },
    ['featured-festival', start.toISOString(), end.toISOString()],
    { tags: ['special-events'], revalidate: 60 * 60 * 24 },
  )()
}

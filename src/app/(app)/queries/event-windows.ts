'use server'

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

async function findInWindow(bounds: WindowBounds, opts: WindowOpts): Promise<Event[]> {
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
  const now = new Date()
  const start = bounds?.start ?? now
  const end =
    bounds?.end ??
    (() => {
      const h = new Date(now)
      h.setUTCDate(h.getUTCDate() + 7)
      return h
    })()

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
}

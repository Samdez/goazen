'use server'

import type { Where } from 'payload'
import type { Event } from '@/payload-types'
import { payload } from '../(client)/payload-client'
import {
  tonightBounds,
  thisWeekBounds,
  weekendBounds,
  commonFilters,
  type WindowBounds,
  type WindowOpts,
} from './window-bounds'

export type HeroLabel = 'tonight' | 'weekend' | 'thisWeek'

export interface HeroResult {
  event: Event
  label: HeroLabel
}

async function pickInWindow(bounds: WindowBounds, opts: WindowOpts): Promise<Event | null> {
  const baseAnd: Where[] = [
    { _status: { equals: 'published' } },
    { date: { greater_than_equal: bounds.start.toISOString() } },
    { date: { less_than: bounds.end.toISOString() } },
    ...commonFilters(opts),
  ]

  const highlighted = await payload.find({
    collection: 'events',
    where: { and: [...baseAnd, { highlighted: { equals: true } }] },
    sort: 'date',
    limit: 1,
    depth: 2,
    draft: false,
  })
  if (highlighted.docs[0]) return highlighted.docs[0]

  const fallback = await payload.find({
    collection: 'events',
    where: { and: baseAnd },
    sort: 'date',
    limit: 1,
    depth: 2,
    draft: false,
  })
  return fallback.docs[0] ?? null
}

export async function getBrowseHero(
  opts: WindowOpts = {},
  now: Date = new Date(),
): Promise<HeroResult | null> {
  const tonight = await pickInWindow(tonightBounds(now), opts)
  if (tonight) return { event: tonight, label: 'tonight' }

  const dow = now.getUTCDay()
  const isWedThuFri = dow === 3 || dow === 4 || dow === 5
  if (isWedThuFri) {
    const weekend = await pickInWindow(weekendBounds(now), opts)
    if (weekend) return { event: weekend, label: 'weekend' }
  }

  const week = await pickInWindow(thisWeekBounds(now), opts)
  if (week) return { event: week, label: 'thisWeek' }

  return null
}

export async function getTonightHero(
  opts: WindowOpts = {},
  now: Date = new Date(),
): Promise<HeroResult | null> {
  const tonight = await pickInWindow(tonightBounds(now), opts)
  return tonight ? { event: tonight, label: 'tonight' } : null
}

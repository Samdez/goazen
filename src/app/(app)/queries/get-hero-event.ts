'use server'

import type { Where } from 'payload'
import type { Event } from '@/payload-types'
import { payload } from '../(client)/payload-client'
import {
  tonightBounds,
  thisWeekBounds,
  weekendBounds,
  type WindowBounds,
} from './window-bounds'

export type HeroLabel = 'tonight' | 'weekend' | 'thisWeek'

export interface HeroResult {
  event: Event
  label: HeroLabel
}

async function pickInWindow(bounds: WindowBounds): Promise<Event | null> {
  const baseWhere: Where = {
    and: [
      { _status: { equals: 'published' } },
      { date: { greater_than_equal: bounds.start.toISOString() } },
      { date: { less_than: bounds.end.toISOString() } },
    ],
  }

  const highlighted = await payload.find({
    collection: 'events',
    where: {
      and: [...(baseWhere.and as Where[]), { highlighted: { equals: true } }],
    },
    sort: 'date',
    limit: 1,
    depth: 2,
    draft: false,
  })
  if (highlighted.docs[0]) return highlighted.docs[0]

  const fallback = await payload.find({
    collection: 'events',
    where: baseWhere,
    sort: 'date',
    limit: 1,
    depth: 2,
    draft: false,
  })
  return fallback.docs[0] ?? null
}

/**
 * Browse-mode hero selector. Walks the most immediate non-empty window, picking
 * the highlighted event (else chronological-first) and labelling by the window
 * name. See ADR-0002.
 */
export async function getBrowseHero(now: Date = new Date()): Promise<HeroResult | null> {
  const tonight = await pickInWindow(tonightBounds(now))
  if (tonight) return { event: tonight, label: 'tonight' }

  const dow = now.getUTCDay()
  const isWedThuFri = dow === 3 || dow === 4 || dow === 5
  if (isWedThuFri) {
    const weekend = await pickInWindow(weekendBounds(now))
    if (weekend) return { event: weekend, label: 'weekend' }
  }

  const week = await pickInWindow(thisWeekBounds(now))
  if (week) return { event: week, label: 'thisWeek' }

  return null
}

/**
 * Focused-mode hero (only for `when=tonight`). Mirrors `getBrowseHero`'s tonight
 * branch — highlighted-then-chronological — but never walks forward to other
 * windows. Returns null when tonight is empty.
 */
export async function getTonightHero(now: Date = new Date()): Promise<HeroResult | null> {
  const tonight = await pickInWindow(tonightBounds(now))
  return tonight ? { event: tonight, label: 'tonight' } : null
}

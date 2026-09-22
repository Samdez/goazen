'use server'

import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'
import { scopeWhere, type EventScope } from '@/lib/event-filters'
import { payload } from '../(client)/payload-client'

export type SiteStats = {
  publishedEvents: number
  upcomingEvents: number
  thisWeek: number
  locations: number
  cities: number
  /** Année du plus ancien événement publié, pour « référencés depuis … ». */
  sinceYear: number
}

export type ScopedStats = {
  /** Tout ce qui a été publié sur ce périmètre, passé compris. */
  total: number
  upcoming: number
  /** Année du plus ancien événement du périmètre, `null` s'il n'y en a aucun. */
  sinceYear: number | null
}

const PUBLISHED: Where = { _status: { equals: 'published' } }

/**
 * Frontière « passé / à venir », identique à celle de `_getEvents` : un
 * événement compte comme à venir jusqu'à la fin de sa journée.
 */
function upcomingFrom(now = new Date()) {
  const boundary = new Date(now)
  boundary.setDate(boundary.getDate() - 1)
  boundary.setUTCHours(22, 0, 0, 0)
  return boundary
}

function endOfWeek(now = new Date()) {
  const end = new Date(now)
  end.setDate(end.getDate() + 7)
  end.setUTCHours(24, 0, 0, 0)
  return end
}

/** `limit: 0` ne ramène aucun document : le compte se fait côté Mongo. */
async function countEvents(conditions: Where[]): Promise<number> {
  const result = await payload.find({
    collection: 'events',
    where: { and: [PUBLISHED, ...conditions] },
    limit: 0,
    depth: 0,
  })
  return result.totalDocs
}

async function _getSiteStats(): Promise<SiteStats> {
  const now = new Date()
  const [published, upcoming, thisWeek, locations, cities, oldest] = await Promise.all([
    countEvents([]),
    countEvents([{ date: { greater_than_equal: upcomingFrom(now) } }]),
    countEvents([
      { date: { greater_than_equal: upcomingFrom(now) } },
      { date: { less_than_equal: endOfWeek(now) } },
    ]),
    payload.find({ collection: 'locations', limit: 0, depth: 0 }),
    payload.find({ collection: 'cities', limit: 0, depth: 0 }),
    payload.find({
      collection: 'events',
      where: PUBLISHED,
      sort: 'date',
      limit: 1,
      depth: 0,
      select: { date: true },
    }),
  ])

  const firstDate = oldest.docs[0]?.date
  return {
    publishedEvents: published,
    upcomingEvents: upcoming,
    thisWeek,
    locations: locations.totalDocs,
    cities: cities.totalDocs,
    sinceYear: firstDate ? new Date(firstDate).getUTCFullYear() : now.getUTCFullYear(),
  }
}

export async function getSiteStats(): Promise<SiteStats> {
  return unstable_cache(async () => await _getSiteStats(), ['site-stats'], {
    tags: ['events'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

/**
 * Les mêmes chiffres, restreints à une salle, une région ou une ville.
 *
 * Le périmètre passe par `scopeWhere`, partagé avec `get-events.ts` : sans ça,
 * le compteur et la liste juste en dessous ne compteraient pas la même chose.
 */
async function _getScopedStats(scope: EventScope): Promise<ScopedStats> {
  const conditions = scopeWhere(scope)
  const [total, upcoming, oldest] = await Promise.all([
    countEvents(conditions),
    countEvents([...conditions, { date: { greater_than_equal: upcomingFrom() } }]),
    payload.find({
      collection: 'events',
      where: { and: [PUBLISHED, ...conditions] },
      sort: 'date',
      limit: 1,
      depth: 0,
      select: { date: true },
    }),
  ])
  // L'année du premier concert du périmètre, pas celle de création de la fiche :
  // une salle ajoutée au CMS en 2026 peut avoir des dates depuis 2024.
  const firstDate = oldest.docs[0]?.date
  return { total, upcoming, sinceYear: firstDate ? new Date(firstDate).getUTCFullYear() : null }
}

export async function getScopedStats(scope: EventScope): Promise<ScopedStats> {
  const cacheKey = JSON.stringify({
    region: scope.region || '',
    city: scope.city || '',
    locationId: scope.locationId || '',
  })

  return unstable_cache(async () => await _getScopedStats(scope), ['scoped-stats', cacheKey], {
    tags: ['events'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

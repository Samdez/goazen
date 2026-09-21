'use server'

import { unstable_cache } from 'next/cache'
import { toDayKey } from '@/lib/day-key'
import { payload } from '../(client)/payload-client'

/**
 * Frontière « passé / à venir », identique à celle de `_getEvents` : un
 * événement ne bascule dans le passé qu'une fois sa journée terminée. Deux
 * bornes divergentes feraient disparaître les concerts du soir des deux côtés.
 */
function pastBoundary(now = new Date()) {
  const boundary = new Date(now)
  boundary.setDate(boundary.getDate() - 1)
  boundary.setUTCHours(22, 0, 0, 0)
  return boundary
}

async function _getPastEvents({ locationId, limit }: { locationId: string; limit: number }) {
  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        { location: { equals: locationId } },
        { date: { less_than: pastBoundary() } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: '-date',
    limit,
    draft: false,
    depth: 2,
  })

  return { docs: events.docs, total: events.totalDocs }
}

/**
 * Les derniers événements passés d'une salle, et leur nombre total.
 *
 * Sert le repli des pages salle sans date à venir : « aucune date annoncée »
 * seul donne une page vide, que les moteurs ne citent jamais. L'archive prouve
 * que le lieu est suivi depuis longtemps.
 */
export async function getPastEvents({
  locationId,
  limit = 3,
}: {
  locationId: string
  limit?: number
}) {
  const cacheKey = JSON.stringify({ locationId, limit, day: toDayKey(new Date()) })

  return unstable_cache(async () => await _getPastEvents({ locationId, limit }), ['past-events', cacheKey], {
    tags: ['events'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

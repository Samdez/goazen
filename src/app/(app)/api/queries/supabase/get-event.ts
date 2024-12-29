'use server'

import { eq, or } from 'drizzle-orm'
import { db } from '../../db/client'
import { events } from '../../db/schema'

export async function getEventFromDB({
  eventPayloadId,
  eventId,
}: {
  eventPayloadId?: string
  eventId?: number
}) {
  const conditions = []
  if (eventPayloadId) conditions.push(eq(events.payloadId, eventPayloadId))
  if (eventId) conditions.push(eq(events.id, eventId))

  const res = await db
    .select()
    .from(events)
    .where(conditions.length > 1 ? conditions[0] : undefined)
    .then((res) => res[0])
  return res
}

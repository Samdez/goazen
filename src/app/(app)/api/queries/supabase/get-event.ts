'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { events } from '../../db/schema'

export async function getEventFromDB({
  eventPayloadId,
  eventId,
}: {
  eventPayloadId?: string
  eventId?: number
}) {
  if (!eventPayloadId && !eventId) {
    throw new Error('no id provided')
  }
  if (eventPayloadId) {
    const res = await db.select().from(events).where(eq(events.payloadId, eventPayloadId))
    if (res.length) {
      return res[0]
    }
  } else if (eventId) {
    const res = await db.select().from(events).where(eq(events.id, eventId))
    if (res.length) {
      return res[0]
    }
  }
}

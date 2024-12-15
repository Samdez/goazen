'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { events } from '../../db/schema'

export async function getEventFromDB(eventPayloadId: string) {
  return db
    .select()
    .from(events)
    .where(eq(events.payloadId, eventPayloadId))
    .then((res) => res[0])
}

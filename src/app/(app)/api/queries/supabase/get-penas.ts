'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function getPenas(eventId: number) {
  return db.select().from(penas).where(eq(penas.eventId, eventId))
}

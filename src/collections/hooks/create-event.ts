import { db } from '@/app/(app)/api/db/client'
import { events } from '@/app/(app)/api/db/schema'
import { sql } from 'drizzle-orm'
import { CollectionAfterChangeHook } from 'payload'

const createEventHook: CollectionAfterChangeHook = async ({ operation, doc }) => {
  if (operation !== 'create' && operation !== 'update') return
  try {
    await db
      .insert(events)
      .values({
        payloadId: doc.id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .onConflictDoUpdate({
        target: events.id,
        set: { payloadId: doc.id, updatedAt: sql`CURRENT_TIMESTAMP` },
      })
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message)
  }

  return new Response(`Event with id ${doc.id} successfully created`, {
    status: 201,
  })
}

export default createEventHook

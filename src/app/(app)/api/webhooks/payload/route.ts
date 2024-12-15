import { eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { events } from '../../db/schema'

interface PostRequestBody {
  eventId: string
}
interface DeleteRequestBody {
  eventId: string
}

export async function POST(request: Request) {
  const req = (await request.json()) as PostRequestBody

  return createOrUpdateEvent(req.eventId)
}
export async function DELETE(request: Request) {
  const req = (await request.json()) as DeleteRequestBody

  return deleteEvent(req.eventId)
}

async function createOrUpdateEvent(id: string) {
  try {
    await db
      .insert(events)
      .values({
        payloadId: id,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .onConflictDoUpdate({
        target: events.id,
        set: { payloadId: id, updatedAt: sql`CURRENT_TIMESTAMP` },
      })
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message)
  }

  return new Response(`Event with id ${id} successfully created`, {
    status: 201,
  })
}

async function deleteEvent(id: string) {
  try {
    await db.delete(events).where(eq(events.payloadId, id))
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message)
  }

  return new Response(`Event with id ${id} successfully deleted`, {
    status: 200,
  })
}

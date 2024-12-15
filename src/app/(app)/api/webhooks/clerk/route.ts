import { WebhookEvent, UserJSON, DeletedObjectJSON } from '@clerk/nextjs/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { users } from '../../db/schema'

export async function POST(request: Request) {
  const { type, data } = (await request.json()) as WebhookEvent
  switch (type) {
    case 'user.created': {
      return createUser(data)
    }
    case 'user.deleted': {
      return deleteUser(data)
    }
  }
}

async function createUser(data: UserJSON) {
  const { id, email_addresses, first_name, last_name } = data

  try {
    await db.insert(users).values({
      clerkId: id,
      active: true,
      email: email_addresses[0]?.email_address ?? null,
      firstName: first_name ?? null,
      lastName: last_name ?? null,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message)
  }

  return new Response(`User with id ${id} successfully created`, {
    status: 201,
  })
}

async function deleteUser(data: DeletedObjectJSON) {
  const { id } = data
  if (!id) throw new Error('Missing id in webhook response')

  try {
    await db
      .update(users)
      .set({ active: false, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.clerkId, id))
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message)
  }

  return new Response(`User with id ${id} successfully deleted`, {
    status: 204,
  })
}

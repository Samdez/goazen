'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { messages, users } from '../../db/schema'

export async function getMessages(penaId: number) {
  return await db
    .select()
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.penaId, penaId))
}

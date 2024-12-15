'use server'

import { db } from '../../db/client'
import { messages } from '../../db/schema'
import { getUserWithClerkId } from './get-user'

export async function createMessage(message: string, userClerkId: string, penaId: number) {
  const user = await getUserWithClerkId(userClerkId)
  return db.insert(messages).values({ createdAt: new Date(), userId: user.id, penaId, message })
}

'use server'

import { revalidatePath } from 'next/cache'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function createPena(userId: number, eventId: number) {
  await db.insert(penas).values({
    createdAt: new Date(),
    updatedAt: new Date(),
    memberOneId: userId,
    eventId,
  })
  revalidatePath(`/lagunekin/${eventId}`)
}

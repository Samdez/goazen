'use server'

import { revalidatePath } from 'next/cache'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function createPena({
  userId,
  eventId,
  isGirls = false,
}: {
  userId: number
  eventId: number
  isGirls?: boolean
}) {
  await db.insert(penas).values({
    createdAt: new Date(),
    updatedAt: new Date(),
    memberOneId: userId,
    eventId,
    isGirls: isGirls ? true : false,
  })
  revalidatePath(`/lagunekin/${eventId}`)
}

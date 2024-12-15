'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function addUserToPena(penaId: number, userId: number, eventId: string) {
  const [currentPena] = await db.select().from(penas).where(eq(penas.id, penaId))

  let updateData = {}
  if (!currentPena.memberTwoId) {
    updateData = { memberTwoId: userId }
  } else if (!currentPena.memberThreeId) {
    updateData = { memberThreeId: userId }
  } else if (!currentPena.memberFourId) {
    updateData = { memberFourId: userId }
  } else {
    throw new Error('Pena is already full')
  }

  await db
    .update(penas)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(penas.id, penaId))
  revalidatePath(`/lagunak/${eventId}`)
}

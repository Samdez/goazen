'use server'

import { and, eq, or } from 'drizzle-orm'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function findUserPena(userId: number, eventId: number) {
  return db
    .select()
    .from(penas)
    .where(
      and(
        eq(penas.eventId, eventId),
        or(
          eq(penas.memberOneId, userId),
          eq(penas.memberTwoId, userId),
          eq(penas.memberThreeId, userId),
          eq(penas.memberFourId, userId),
        ),
      ),
    )
}

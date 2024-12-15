'use server'

import { and } from 'drizzle-orm'
import { eq, isNull, or } from 'drizzle-orm'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function findPenaWithMissingMembers(eventId: number) {
  return db
    .select()
    .from(penas)
    .where(
      and(
        eq(penas.eventId, eventId),
        or(isNull(penas.memberFourId), isNull(penas.memberThreeId), isNull(penas.memberTwoId)),
      ),
    )
}

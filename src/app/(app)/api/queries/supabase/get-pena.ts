'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { penas } from '../../db/schema'

export async function getPena(penaId: number) {
  return db
    .select()
    .from(penas)
    .where(eq(penas.id, penaId))
    .then((res) => res[0])
}

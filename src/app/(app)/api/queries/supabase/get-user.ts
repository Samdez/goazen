'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { users } from '../../db/schema'

export async function getUser(clerkId: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .then((res) => res[0])
}

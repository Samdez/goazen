'use server'

import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { users } from '../../db/schema'

export async function getUserWithClerkId(clerkId: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .then((res) => res[0])
}

export async function getUserWithId(id: number) {
  return db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .then((res) => res[0])
}

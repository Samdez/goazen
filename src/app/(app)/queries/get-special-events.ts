'use server'
import { payload } from '../(client)/payload-client'

export async function getSpecialEvents() {
  const specialEvent = await payload.find({
    collection: 'special-events',
    limit: 100,
  })
  return specialEvent
}

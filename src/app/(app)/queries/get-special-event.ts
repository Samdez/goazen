'use server'
import { payload } from '../(client)/payload-client'

export async function getSpecialEvent(slug: string) {
  const specialEvent = await payload.find({
    collection: 'special-events',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  return specialEvent
}

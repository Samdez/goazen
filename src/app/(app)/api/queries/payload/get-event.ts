'use server'

import { payload } from '../../payload-client'

export async function getEvent(slug: string) {
  const event = await payload.findByID({ collection: 'events', id: slug })
  return event
}

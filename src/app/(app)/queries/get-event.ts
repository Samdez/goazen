'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function getEvent(slug: string) {
  const payload = await getPayload({ config })
  const event = await payload.findByID({ collection: 'events', id: slug })
  return event
}

'use server'

import { unstable_cache } from 'next/cache'
import { eventTag } from '@/lib/cache-tags'
import { payload } from '../(client)/payload-client'

// Pas de durée : l'entrée vit jusqu'à la modification de l'événement, qui
// révalide `event:<id>` (hook afterChange de la collection Events).
export async function getEvent(id: string) {
  return unstable_cache(
    async () => await payload.findByID({ collection: 'events', id }),
    ['event', id],
    { tags: [eventTag(id)], revalidate: false },
  )()
}

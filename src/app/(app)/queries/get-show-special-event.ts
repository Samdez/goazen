'use server'
import type { SpecialEvent } from '@/payload-types'
import { payload } from '../(client)/payload-client'

// Returns the special event to feature on the home, or null when the CMS
// toggle is off / no event is selected. Never throws so the home can't 500.
export async function getShowSpecialEvent(): Promise<SpecialEvent | null> {
  const global = await payload.findGlobal({
    slug: 'show-special-event',
  })
  if (
    global.show_special_event !== true ||
    !global.special_event ||
    typeof global.special_event !== 'object'
  ) {
    return null
  }
  return global.special_event
}

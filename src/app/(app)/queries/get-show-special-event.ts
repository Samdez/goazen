'use server'
import { payload } from '../(client)/payload-client'

export async function getShowSpecialEvent() {
  const showSpecialEvent = await payload.findGlobal({
    slug: 'show-special-event',
  })
  if (
    typeof showSpecialEvent.show_special_event !== 'boolean' ||
    !showSpecialEvent.special_event ||
    typeof showSpecialEvent.special_event !== 'object'
  ) {
    throw new Error('Something went wrong with the special event')
  }
  return {
    showSpecialEvent: showSpecialEvent.show_special_event,
    specialEvent: showSpecialEvent.special_event,
  }
}

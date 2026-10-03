'use client'

import type { Event } from '@/payload-types'
import EventsCarousel from './EventsCarousel'
import { useUpcomingEvents } from '../hooks/useUpcomingEvents'

/**
 * « Prochains concerts » de la salle, sur une page événement.
 *
 * La page est figée en cache avec son instantané de la programmation : la
 * section disparaît d'elle-même quand toutes ces dates sont passées, plutôt
 * que de laisser un titre au-dessus d'un carrousel vide.
 */
export default function VenueUpcomingEvents({
  venueName,
  events,
  placeholderImageUrl,
}: {
  venueName?: string | null
  events: Event[]
  placeholderImageUrl: string
}) {
  const upcomingEvents = useUpcomingEvents(events)
  if (!upcomingEvents.length) return null

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8 text-white w-full">
      <h2 className="text-center text-6xl font-bold text-black">{venueName}</h2>
      <h2 className="text-4xl text-black">Prochains concerts: </h2>
      <EventsCarousel events={upcomingEvents} placeholderImageUrl={placeholderImageUrl} />
    </div>
  )
}

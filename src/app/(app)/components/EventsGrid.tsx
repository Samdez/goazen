'use client'

import { Event } from '@/payload-types'
import EventThumbnail from './EventThumbnail'
import { useEffect, useState } from 'react'
import { getEvents } from '../queries/get-events'
import { useInView } from 'react-intersection-observer'

export default function EventsGrid({
  initialEvents,
  initialNextPage,
  startDate,
  placeholderImageUrl,
  locationId,
}: {
  initialEvents: Event[]
  initialNextPage?: number | null
  startDate: string
  placeholderImageUrl: string
  locationId?: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(true)
  const { ref, inView } = useInView()

  const loadMoreEvents = async () => {
    const newEvents = await getEvents({
      page: nextPage ? nextPage : undefined,
      startDate,
      locationId,
    })
    setEvents((events) => [...events, ...newEvents.docs])
    setNextPage((prevPage) => (newEvents.nextPage ? newEvents.nextPage : prevPage))
    setHasNextPage(newEvents.hasNextPage)
  }
  useEffect(() => {
    if (inView) {
      loadMoreEvents()
    }
  }, [inView])

  return (
    <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
      {events.map((event) => (
        <EventThumbnail event={event} key={event.id} placeholderImageUrl={placeholderImageUrl} />
      ))}
      {/* {hasNextPage && <div ref={ref}>Loading...</div>} */}
    </div>
  )
}

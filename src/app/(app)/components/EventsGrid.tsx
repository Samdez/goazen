'use client'

import { Event } from '@/payload-types'
import EventThumbnail from './EventThumbnail'
import { useEffect, useState } from 'react'
import { getEvents } from '../queries/get-events'
import { useInView } from 'react-intersection-observer'

export default function EventsGrid({
  initialEvents,
  placeholderImageUrl,
  initialNextPage,
  startDate,
}: {
  initialEvents: Event[]
  placeholderImageUrl: string
  initialNextPage?: number | null
  startDate: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(true)
  const { ref, inView } = useInView()

  const loadMoreEvents = async () => {
    const newEvents = await getEvents({ page: nextPage ? nextPage : undefined, startDate })
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
    <>
      {events.map((event) => (
        <EventThumbnail event={event} placeholderImageUrl={placeholderImageUrl} key={event.id} />
      ))}
      {hasNextPage && <div ref={ref}>Loading...</div>}
    </>
  )
}

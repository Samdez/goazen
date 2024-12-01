'use client'

import { Event } from '@/payload-types'
import EventThumbnail from './EventThumbnail'
import { useEffect, useState } from 'react'
import { getEvents } from '../queries/get-events'
import { useInView } from 'react-intersection-observer'
import { PacmanLoader } from 'react-spinners'
import { PaginatedDocs } from 'payload'

export default function EventsGrid({
  initialEvents,
  initialNextPage,
  startDate,
  placeholderImageUrl,
  locationId,
  hasNextPageProps,
}: {
  initialEvents: Event[]
  initialNextPage?: number | null
  hasNextPageProps: boolean
  startDate: string
  placeholderImageUrl: string
  locationId?: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(hasNextPageProps)
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
    if (inView && hasNextPage) {
      loadMoreEvents()
    }
  }, [inView])

  return (
    <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
      {events.map((event) => (
        <EventThumbnail event={event} key={event.id} placeholderImageUrl={placeholderImageUrl} />
      ))}
      {hasNextPage && (
        <div className="flex h-32 w-full items-center justify-center" ref={ref}>
          <PacmanLoader />
        </div>
      )}
    </div>
  )
}

'use client'

import type { Event } from '@/payload-types'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PacmanLoader } from 'react-spinners'
import EventThumbnail from './EventThumbnail'
import EmptyEventsSection from './EmptyEventsSection'
import { useCategory } from '../hooks/useGenre'
import { useSearchParams } from 'next/navigation'
import { getEvents } from '../api/queries/payload/get-events'

export default function EventsGrid({
  initialEvents,
  initialNextPage,
  startDate,
  endDate,
  placeholderImageUrl,
  locationId,
  hasNextPageProps,
  activeTime,
}: {
  initialEvents: Event[]
  initialNextPage?: number | null
  hasNextPageProps: boolean
  startDate?: string
  endDate?: string
  activeTime?: string
  placeholderImageUrl: string
  locationId?: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(hasNextPageProps)
  const { ref, inView } = useInView()
  const category = useCategory()
  const searchParams = useSearchParams()

  const loadMoreEvents = async () => {
    const newEvents = await getEvents({
      page: nextPage ? nextPage : undefined,
      startDate,
      endDate,
      locationId,
    })
    setEvents((events) => [...events, ...newEvents.docs])
    setNextPage((prevPage) => (newEvents.nextPage ? newEvents.nextPage : prevPage))
    setHasNextPage(newEvents.hasNextPage)
  }

  useEffect(() => {
    const loadInitialEvents = async () => {
      const eventsData = await getEvents({ startDate, endDate, category })
      setEvents(eventsData.docs)
    }
    loadInitialEvents()
  }, [searchParams])
  useEffect(() => {
    if (inView && hasNextPage) {
      loadMoreEvents()
    }
  }, [inView])

  if (!events.length) {
    return <EmptyEventsSection activeTime={activeTime} category={category} />
  }

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

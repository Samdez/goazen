'use client'

import type { Event } from '@/payload-types'
import { useEffect, useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { PacmanLoader } from 'react-spinners'
import { getCachedEvents } from '../queries/get-events'
import EventThumbnail from './EventThumbnail'
import EmptyEventsSection from './EmptyEventsSection'
import { useCategory } from '../hooks/useGenre'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function EventsGrid({
  initialEvents,
  initialNextPage,
  startDate,
  endDate,
  placeholderImageUrl,
  locationId,
  hasNextPageProps,
  activeTime,
  region,
}: {
  initialEvents: Event[]
  initialNextPage?: number | null
  hasNextPageProps: boolean
  startDate: string
  endDate?: string
  activeTime?: string
  placeholderImageUrl: string
  locationId?: string
  region?: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(hasNextPageProps)
  const { ref, inView } = useInView()
  const category = useCategory()
  const searchParams = useSearchParams()
  const prevRegionRef = useRef(region)

  const loadMoreEvents = async () => {
    const newEvents = await getCachedEvents({
      page: nextPage ? nextPage : undefined,
      startDate,
      endDate,
      locationId,
      category,
      region,
    })
    setEvents((events) => [...events, ...newEvents.docs])
    setNextPage((prevPage) => (newEvents.nextPage ? newEvents.nextPage : prevPage))
    setHasNextPage(newEvents.hasNextPage)
  }

  // Reset events when region changes
  useEffect(() => {
    if (prevRegionRef.current !== region) {
      setEvents(initialEvents)
      setNextPage(initialNextPage)
      setHasNextPage(hasNextPageProps)
      prevRegionRef.current = region
    }
  }, [region, initialEvents, initialNextPage, hasNextPageProps])

  // Only reload events when search params change (not on initial mount)
  useEffect(() => {
    const loadInitialEvents = async () => {
      const eventsData = await getCachedEvents({
        startDate,
        endDate,
        category,
        region,
        locationId,
      })
      if (prevRegionRef.current === region) {
        // Only update if region hasn't changed
        setEvents(eventsData.docs)
        setNextPage(eventsData.nextPage)
        setHasNextPage(eventsData.hasNextPage)
      }
    }

    // Skip the initial mount effect
    const searchParamsString = searchParams.toString()
    if (searchParamsString) {
      loadInitialEvents()
    }
  }, [searchParams, region, startDate, endDate, category, locationId])

  useEffect(() => {
    if (inView && hasNextPage) {
      loadMoreEvents()
    }
  }, [inView, hasNextPage])

  if (!events.length) {
    return <EmptyEventsSection activeTime={activeTime} category={category} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 px-12 md:px-32 gap-24 pb-32">
      {events.map((event) => (
        <div key={event.id} className="flex justify-center w-full">
          <EventThumbnail
            event={event}
            placeholderImageUrl={placeholderImageUrl}
            className="w-full"
          />
        </div>
      ))}
      {hasNextPage && (
        <div className="flex h-32 w-full items-center justify-center col-span-full" ref={ref}>
          <PacmanLoader />
        </div>
      )}
    </div>
  )
}

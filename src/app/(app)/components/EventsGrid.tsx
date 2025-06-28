'use client'

import type { Event } from '@/payload-types'
import { useEffect, useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { PacmanLoader } from 'react-spinners'
import { getCachedEvents } from '../queries/get-events'
import EventThumbnail from './EventThumbnail'
import EmptyEventsSection from './EmptyEventsSection'
import { useCategory } from '../hooks/useGenre'
import { useParams, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

type EventsGridProps = {
  initialEvents: Event[]
  initialNextPage?: number | null
  hasNextPageProps: boolean
  startDate: string
  endDate?: string
  activeTime?: string
  placeholderImageUrl: string
  locationId?: string
  region?: string
  specialEvent?: string
  selectionOnly?: boolean
}

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
  specialEvent,
  selectionOnly,
}: EventsGridProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(hasNextPageProps)
  const [isLoading, setIsLoading] = useState(false)
  const { ref, inView } = useInView()
  const category = useCategory()
  const searchParams = useSearchParams()
  const params = useParams()
  const cityParam = params.city as string

  const prevRegionRef = useRef(region)
  const prevSearchParamsRef = useRef(searchParams.toString())
  const prevSelectionOnlyRef = useRef(selectionOnly)

  useEffect(() => {
    const currentSearchParams = searchParams.toString()
    const hasSearchParamsChanged = prevSearchParamsRef.current !== currentSearchParams
    const hasRegionChanged = prevRegionRef.current !== region
    const hasSelectionOnlyChanged = prevSelectionOnlyRef.current !== selectionOnly

    // Only reset if something actually changed
    if (!hasSearchParamsChanged && !hasRegionChanged && !hasSelectionOnlyChanged) {
      return
    }

    // Update refs
    prevSearchParamsRef.current = currentSearchParams
    prevRegionRef.current = region
    prevSelectionOnlyRef.current = selectionOnly

    // If we're on the initial load with the same filters that were used to fetch initialEvents,
    // just use the initial events instead of refetching
    const isInitialLoad = events === initialEvents
    const hasMatchingFilters =
      (!category ||
        events.some((event) =>
          event.category?.some((cat) => typeof cat !== 'string' && cat.slug === category),
        )) &&
      (!region ||
        events.some((event) => {
          if (typeof event.location === 'string') return false
          const cityV2 = event.location?.['city V2']
          return typeof cityV2 !== 'string' && cityV2?.region === region
        })) &&
      (!locationId ||
        events.some(
          (event) => typeof event.location !== 'string' && event.location?.id === locationId,
        )) &&
      (!specialEvent ||
        events.some(
          (event) =>
            typeof event.special_event !== 'string' && event.special_event?.slug === specialEvent,
        )) &&
      (selectionOnly === undefined ||
        events.some((event) => event.add_to_selection === selectionOnly))

    if (isInitialLoad && hasMatchingFilters) {
      return
    }

    const loadInitialEvents = async () => {
      try {
        setIsLoading(true)
        const eventsData = await getCachedEvents({
          startDate,
          endDate,
          category,
          region,
          locationId,
          specialEvent,
          selectionOnly,
          city: cityParam,
        })
        setEvents(eventsData.docs)
        setNextPage(eventsData.nextPage)
        setHasNextPage(eventsData.hasNextPage)
      } catch (error) {
        console.error('Error loading initial events:', error)
        // On error, reset to initial state
        setEvents(initialEvents)
        setNextPage(initialNextPage)
        setHasNextPage(hasNextPageProps)
      } finally {
        setIsLoading(false)
      }
    }

    // Load new events if we have filters that don't match our current events
    loadInitialEvents()
  }, [searchParams, region, category, locationId, selectionOnly, events, initialEvents])

  const loadMoreEvents = async () => {
    if (!nextPage || isLoading) return

    try {
      setIsLoading(true)
      const newEvents = await getCachedEvents({
        page: nextPage,
        startDate,
        endDate,
        locationId,
        category,
        region,
        city: cityParam,
        specialEvent,
        selectionOnly,
      })
      setEvents((prev) => [...prev, ...newEvents.docs])
      setNextPage(newEvents.nextPage)
      setHasNextPage(newEvents.hasNextPage)
    } catch (error) {
      console.error('Error loading more events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      loadMoreEvents()
    }
  }, [inView, hasNextPage, isLoading])

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
      {(hasNextPage || isLoading) && (
        <div className="flex h-32 w-full items-center justify-center col-span-full" ref={ref}>
          <PacmanLoader />
        </div>
      )}
    </div>
  )
}

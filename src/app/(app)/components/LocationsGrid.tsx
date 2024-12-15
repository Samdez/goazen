'use client'
import LocationCard from './LocationCard'

import type { Location } from '@/payload-types'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PacmanLoader } from 'react-spinners'
import { getLocations } from '../api/queries/payload/get-locations'

export default function LocationsGrid({
  initialLocations,
  initialNextPage,
  placeholderImageUrl,
  hasNextPageProps,
}: {
  initialLocations: Location[]
  initialNextPage?: number | null
  hasNextPageProps: boolean
  placeholderImageUrl: string
}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(hasNextPageProps)
  const { ref, inView } = useInView()

  const loadMoreEvents = async () => {
    const newLocations = await getLocations({
      page: nextPage ? nextPage : undefined,
    })
    setLocations((locations) => [...locations, ...newLocations.docs])
    setNextPage((prevPage) => (newLocations.nextPage ? newLocations.nextPage : prevPage))
    setHasNextPage(newLocations.hasNextPage)
  }

  useEffect(() => {
    if (inView && hasNextPage) {
      loadMoreEvents()
    }
  }, [inView])

  if (!locations.length) {
    return <div>No locations found</div>
  }

  return (
    <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
      {locations.map((location, i) => (
        <LocationCard
          isEven={i % 2 === 0}
          location={location}
          key={location.id}
          placeholderImageUrl={placeholderImageUrl}
        />
      ))}
      {hasNextPage && (
        <div className="flex h-32 w-full items-center justify-center" ref={ref}>
          <PacmanLoader />
        </div>
      )}
    </div>
  )
}

'use client'
import LocationCard from './LocationCard'

import type { Location } from '@/payload-types'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PacmanLoader } from 'react-spinners'
import { useCategory } from '../hooks/useGenre'
import { getLocations } from '../queries/get-locations'
import Image from 'next/image'

export default function LocationsGrid({
  initialLocations,
  initialNextPage,
  placeholderImageUrl,
  hasNextPageProps,
  cityName,
}: {
  initialLocations: Location[]
  initialNextPage?: number | null
  hasNextPageProps: boolean
  placeholderImageUrl: string
  cityName: string
}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [hasNextPage, setHasNextPage] = useState(hasNextPageProps)
  const { ref, inView } = useInView()

  const loadMoreLocations = async () => {
    const newLocations = await getLocations({
      cityName,
      page: nextPage ? nextPage : undefined,
    })
    setLocations((locations) => [...locations, ...newLocations.docs])
    setNextPage((prevPage) => (newLocations.nextPage ? newLocations.nextPage : prevPage))
    setHasNextPage(newLocations.hasNextPage)
  }

  useEffect(() => {
    if (inView && hasNextPage) {
      loadMoreLocations()
    }
  }, [inView])

  if (!locations.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-">
        <p>
          Goazen! n&apos;a pas encore répertorié de salles de concert dans cette ville. Si tu
          voudrais voir la tienne y figurer, envoie nous un mail via le formulaire de contact!
        </p>
        <Image src={placeholderImageUrl} alt="placeholder" height={400} width={400} />
      </div>
    )
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

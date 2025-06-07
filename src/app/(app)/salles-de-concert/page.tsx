import { Button } from '@/components/ui/button'
import GenreButton from '../components/GenreButton'
import LocationsGrid from '../components/LocationsGrid'
import { getCities } from '../queries/get-cities'
import { getLocations } from '../queries/get-locations'
import { getPlaceholderImage } from '../queries/get-placeholder-image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FilterByCity from '../components/FilterByCity'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'

async function LocationsPage({ searchParams }: { searchParams: Promise<{ city: string }> }) {
  const currSearchParams = await searchParams
  const activeCity = currSearchParams.city
  const [locations, cities, defaultImage] = await Promise.all([
    getLocations({ cityName: activeCity }),
    getCities(),
    getPlaceholderImage(),
  ])

  return (
    <>
      <div className="flex w-full flex-wrap justify-evenly gap-1 py-4">
        <FilterByCity activeCity={activeCity} cities={cities} />
      </div>
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
        key={activeCity}
      >
        <LocationsGrid
          initialLocations={locations.docs}
          initialNextPage={locations.nextPage}
          hasNextPageProps={locations.hasNextPage}
          placeholderImageUrl={defaultImage || ''}
          cityName={activeCity}
        />
      </Suspense>
    </>
  )
}

export default LocationsPage

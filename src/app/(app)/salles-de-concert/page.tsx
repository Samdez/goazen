import LocationsGrid from '../components/LocationsGrid'
import { getCities } from '../queries/get-cities'
import { getLocations } from '../queries/get-locations'
import { getPlaceholderImage } from '../queries/get-placeholder-image'
import FilterByCity from '../components/FilterByCity'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import { CityFilterCombobox } from '../components/CityFilterCombobox'

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
      <div className="pb-8 md:px-32 md:flex w-full justify-evenly">
        <div className="flex flex-col justify-center px-2">
          <h1 className="text-balance text-2xl md:pl-8 text-center md:text-left">
            Tous les bars et salles de concert du Pays Basque et des Landes
          </h1>
          <h2 className="font-text md:pl-8 text-lg leading-none text-center md:text-left">
            Retrouve tous les lieux où écouter de la musique dans le Pays Basque et les Landes
          </h2>
        </div>
        <div className="flex gap-2 justify-center pt-4">
          <CityFilterCombobox
            cities={[
              ...cities,
              { id: 'all', name: 'Toutes les villes', createdAt: '', updatedAt: '' },
            ]}
            isLocationsPage={true}
          />
        </div>
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

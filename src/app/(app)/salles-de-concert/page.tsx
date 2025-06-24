import LocationsGrid from '../components/LocationsGrid'
import { getCities } from '../queries/get-cities'
import { getLocations } from '../queries/get-locations'
import { getPlaceholderImage } from '../queries/get-placeholder-image'
import FilterByCity from '../components/FilterByCity'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import { CityFilterCombobox } from '../components/CityFilterCombobox'
import UnifiedFilterSections from '../components/UnifiedFilterSection'

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
      <UnifiedFilterSections
        title={`Tous les bars et salles de concert du Pays Basque et des Landes`}
        subTitle={`Retrouve tous les lieux où écouter de la musique dans le Pays Basque et les Landes`}
        buttons={[
          <CityFilterCombobox
            key="city-filter"
            cities={[
              ...cities.docs,
              { id: 'all', name: 'Toutes les villes', createdAt: '', updatedAt: '' },
            ]}
            isLocationsPage={true}
          />,
        ]}
      />
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

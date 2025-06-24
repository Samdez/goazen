import LocationsGrid from '../../components/LocationsGrid'
import { getCities } from '../../queries/get-cities'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { CityFilterCombobox } from '../../components/CityFilterCombobox'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'

async function LocationsPage({ params }: { params: Promise<{ city: string }> }) {
  const cityParam = (await params).city
  const locations = await getLocations({ cityName: cityParam })
  const placeholderImageUrl = await getPlaceholderImage()
  const cities = await getCities()

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
      <LocationsGrid
        initialLocations={locations.docs}
        initialNextPage={locations.nextPage}
        hasNextPageProps={locations.hasNextPage}
        placeholderImageUrl={placeholderImageUrl || ''}
        cityName={cityParam}
      />
    </>
  )
}

export default LocationsPage

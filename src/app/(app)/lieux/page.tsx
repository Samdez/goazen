import LocationsGrid from '../components/LocationsGrid'
import { getLocations } from '../queries/get-locations'
import { getPlaceholderImage } from '../queries/get-placeholder-image'

async function LocationsPage() {
  const locations = await getLocations({})
  const placeholderImageUrl = await getPlaceholderImage()

  return (
    <LocationsGrid
      initialLocations={locations.docs}
      initialNextPage={locations.nextPage}
      hasNextPageProps={locations.hasNextPage}
      placeholderImageUrl={placeholderImageUrl || ''}
    />
  )
}

export default LocationsPage

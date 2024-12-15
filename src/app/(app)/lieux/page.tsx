import { getLocations } from '../api/queries/payload/get-locations'
import { getPlaceholderImage } from '../api/queries/payload/get-placeholder-image'
import LocationsGrid from '../components/LocationsGrid'

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

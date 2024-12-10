import LocationCard from '../components/LocationCard'
import { getLocations } from '../queries/get-locations'
import { getPlaceholderImage } from '../queries/get-placeholder-image'

async function LocationsPage() {
  const locations = await getLocations()
  const placeholderImageUrl = await getPlaceholderImage()

  return (
    <>
      <div className="flex flex-wrap justify-around gap-8">
        {locations.docs.map((location, i) => {
          return (
            <LocationCard
              isEven={i % 2 === 0}
              location={location}
              key={location.id}
              placeholderImageUrl={placeholderImageUrl || ''}
            />
          )
        })}
      </div>
    </>
  )
}

export default LocationsPage

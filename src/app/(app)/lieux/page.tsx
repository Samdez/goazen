import LocationCard from '../components/LocationCard'
import { getLocations } from '../queries/get-locations'

async function LocationsPage() {
  const locations = await getLocations()

  return (
    <>
      <div className="flex flex-wrap justify-around gap-8">
        {locations.docs.map((location, i) => {
          return <LocationCard isEven={i % 2 === 0} location={location} key={location.id} />
        })}
      </div>
    </>
  )
}

export default LocationsPage

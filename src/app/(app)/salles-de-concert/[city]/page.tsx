import { Button } from '@/components/ui/button'
import LocationsGrid from '../../components/LocationsGrid'
import { getCities } from '../../queries/get-cities'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import Link from 'next/link'

async function LocationsPage({ params }: { params: Promise<{ city: string }> }) {
  const cityParam = (await params).city
  const locations = await getLocations({ cityName: cityParam })
  const placeholderImageUrl = await getPlaceholderImage()
  const cities = await getCities()

  return (
    <>
      <div className="flex w-full flex-wrap justify-evenly gap-1 py-4 md:w-full">
        {cities.map((city) => {
          return (
            <Link href={`/concerts/${city.slug}`} key={city.id}>
              <Button
                className={`hover:bg-black[#E2B748]  h-10 w-20 text-pretty border-2 border-black bg-white text-black hover:border-none hover:text-[#ee2244bc] ${
                  city.slug === cityParam && 'border-none text-[#ee2244bc]'
                }`}
              >
                {city.name}
              </Button>
            </Link>
          )
        })}
      </div>
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

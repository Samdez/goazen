import { Button } from '@/components/ui/button'
import LocationsGrid from '../../components/LocationsGrid'
import { getCities } from '../../queries/get-cities'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import Link from 'next/link'
import { CityFilterCombobox } from '../../components/CityFilterCombobox'

async function LocationsPage({ params }: { params: Promise<{ city: string }> }) {
  const cityParam = (await params).city
  const locations = await getLocations({ cityName: cityParam })
  const placeholderImageUrl = await getPlaceholderImage()
  const cities = await getCities()

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
      {/* <div className="flex w-full flex-wrap justify-evenly gap-1 py-4 md:w-full">
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
      </div> */}
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

import LocationsGrid from '../../components/LocationsGrid'
import { getCities } from '../../queries/get-cities'
import { getLocations } from '../../queries/get-locations'
import { getCity } from '../../queries/get-city'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { CityFilterCombobox } from '../../components/CityFilterCombobox'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'
import { Suspense } from 'react'

export async function generateStaticParams() {
  const cities = await getCities()

  return cities.docs.map((city) => ({
    city: city.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const cityParam = (await params).city
  const cityData = await getCity(cityParam)
  const cityName = cityData?.name || cityParam.charAt(0).toUpperCase() + cityParam.slice(1)
  const title = `Salles de concert à ${cityName} — bars & lives | Goazen`
  const description = `Tous les bars et salles de concert à ${cityName} : où écouter de la musique live, des DJ sets et sortir ce soir au Pays Basque et dans les Landes.`
  const canonical = `https://goazen.info/salles-de-concert/${cityParam}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
  }
}

async function LocationsPage({ params }: { params: Promise<{ city: string }> }) {
  const cityParam = (await params).city
  const [locations, placeholderImageUrl, cities] = await Promise.all([
    getLocations({ cityName: cityParam }),
    getPlaceholderImage(),
    getCities(),
  ])

  return (
    <>
      <UnifiedFilterSections
        title={`Tous les bars et salles de concert du Pays Basque et des Landes`}
        subTitle={`Retrouve tous les lieux où écouter de la musique dans le Pays Basque et les Landes`}
        buttons={[
          <Suspense key="city-filter-suspense" fallback={<div>Loading...</div>}>
            <CityFilterCombobox
              key="city-filter"
              cities={[
                ...cities.docs,
                { id: 'all', name: 'Toutes les villes', createdAt: '', updatedAt: '' },
              ]}
              isLocationsPage={true}
            />
          </Suspense>,
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

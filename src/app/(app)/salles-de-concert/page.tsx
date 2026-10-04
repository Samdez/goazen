import LocationsGrid from '../components/LocationsGrid'
import { getCities } from '../queries/get-cities'
import { getLocationCards } from '../queries/get-locations'
import { getPlaceholderImage } from '../queries/get-placeholder-image'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import { CityFilterCombobox } from '../components/CityFilterCombobox'
import UnifiedFilterSections from '../components/UnifiedFilterSection'
import { OG_IMAGE } from '@/lib/structured-data'

// Annuaire complet, sans filtre : en cache, régénéré seulement quand une salle
// ou une ville change (tags `locations` et `cities`). Le filtre par ville vit
// sur /salles-de-concert/[city] ; l'ancienne URL `?city=` y est redirigée par
// next.config.ts. Ne pas relire `searchParams` ici : la page redeviendrait
// dynamique (rendue à chaque requête).
export const revalidate = false

export async function generateMetadata() {
  const title = 'Salles de concert & bars — Pays Basque & Landes | Goazen'
  const description =
    'Tous les bars et salles de concert du Pays Basque et des Landes : où écouter de la musique live, des DJ sets et sortir près de chez toi.'
  const canonical = 'https://goazen.info/salles-de-concert'

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Goazen!',
      images: [OG_IMAGE],
      locale: 'fr_FR',
      type: 'website',
    },
  }
}

async function LocationsPage() {
  const [locations, cities, defaultImage] = await Promise.all([
    getLocationCards({}),
    getCities(),
    getPlaceholderImage(),
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
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <LocationsGrid
          initialLocations={locations.docs}
          initialNextPage={locations.nextPage}
          hasNextPageProps={locations.hasNextPage}
          placeholderImageUrl={defaultImage || ''}
          cityName=""
        />
      </Suspense>
    </>
  )
}

export default LocationsPage

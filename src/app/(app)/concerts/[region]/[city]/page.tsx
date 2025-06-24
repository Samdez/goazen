import { JSX, Suspense } from 'react'
import { getCachedEvents } from '../../../queries/get-events'
import { getLocations } from '../../../queries/get-locations'
import { getPlaceholderImage } from '../../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { Event } from '@/payload-types'
import EventThumbnail from '../../../components/EventThumbnail'
import { cn } from '@/lib/utils'
import { darkerGrotesque } from '../../../fonts'
import { getCity } from '../../../queries/get-city'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { CityFilterCombobox } from '@/app/(app)/components/CityFilterCombobox'
import { getCities } from '@/app/(app)/queries/get-cities'
import UnifiedFilterSections from '@/app/(app)/components/UnifiedFilterSection'
import { DateFilterComboBox } from '@/app/(app)/components/DateFilterComboBox'
import { GenreFilterComboBox } from '@/app/(app)/components/GenreFilterComboBox'
import EventsGrid from '@/app/(app)/components/EventsGrid'
import RelatedLocations from '@/app/(app)/components/RelatedLocations'

function RichTextWrapper({ data }: { data: any }) {
  return (
    <div className={darkerGrotesque.className}>
      <RichText data={data} />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ city: string[] }> }) {
  const cityParam = (await params).city
  const cityName = Array.isArray(cityParam) ? cityParam[0] : cityParam
  const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1)
  return {
    title: `Concerts et Soirées à ${formattedCityName} | Où Sortir ce Soir - Goazen!`,
    description: `Agenda des concerts et soirées à ${formattedCityName} : rock, électro, DJ sets. Découvrez la programmation des salles de concert au Pays Basque et dans les Landes.`,
    alternates: {
      canonical: `https://goazen.info/concerts/${cityName}`,
    },
    openGraph: {
      title: `Concerts et Soirées à ${formattedCityName} | Agenda Complet - Goazen!`,
      description: `Agenda des concerts et soirées à ${formattedCityName}. Découvrez tous les événements musicaux et trouvez votre prochaine sortie au Pays Basque ce soir !`,
      url: `https://goazen.info/concerts/${cityName}`,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Concerts à ${formattedCityName} | Agenda Complet`,
      description: `Agenda des concerts et soirées à ${formattedCityName}. Trouvez votre prochaine sortie au Pays Basque !`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string; region: string }>
}) {
  const cityParam = (await params).city
  const regionParam = (await params).region
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  const [locations, city, cities] = await Promise.all([
    getLocations({ cityName: cityParam, limit: 100 }),
    getCity(cityParam),
    getCities(regionParam),
  ])

  const events = await getCachedEvents({
    city: cityParam,
    startDate: new Date().toISOString(),
  })

  return (
    <>
      <UnifiedFilterSections
        title={`Concerts, soirées et DJ sets ${regionParam === 'pays-basque' ? 'au Pays Basque' : 'dans les Landes'}`}
        subTitle={`Tous les concerts et soirées à venir:`}
        buttons={[
          <CityFilterCombobox
            key="city-filter"
            cities={[
              ...cities.docs,
              { id: 'all', name: 'Toutes les villes', createdAt: '', updatedAt: '' },
            ]}
          />,
        ]}
      />
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <EventsGrid
          initialEvents={events.docs}
          initialNextPage={events.nextPage}
          hasNextPageProps={events.hasNextPage}
          startDate={new Date().toISOString()}
          endDate={new Date().toISOString()}
          placeholderImageUrl={placeholderImage}
          region={regionParam}
        />
      </Suspense>

      <div className="max-w-full mx-auto px-6 py-8 text-gray-800">
        {city['rich text description'] && <RichTextWrapper data={city['rich text description']} />}
      </div>
      <div className={cn(darkerGrotesque.className, 'max-w-full mx-auto px-6 py-8 text-gray-800')}>
        {/* <h2 className="text-2xl font-bold mb-4">Où écouter de la musique à {city.name} :</h2> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4 pb-4">
          {locations.docs
            .reduce((acc, location, index) => {
              if (index % 5 === 0) {
                acc.push([])
              }
              acc[acc.length - 1].push(
                <li key={location.id}>
                  <Link href={`/concerts/${regionParam}/${city.slug}/${location.slug}`}>
                    <h3 className="text-lg font-bold hover:text-white transition-all">
                      {location.name}
                    </h3>
                  </Link>
                </li>,
              )
              return acc
            }, [] as JSX.Element[][])
            .map((column, colIndex) => (
              <ul key={colIndex} className="space-y-2">
                {column}
              </ul>
            ))}
        </div> */}
        <div>
          <RelatedLocations
            locations={locations}
            regionParam={regionParam}
            city={city}
            sectionTitle={`Où écouter de la musique à ${city.name} :`}
          />
          <RelatedLocations
            locations={cities}
            regionParam={regionParam}
            city={city}
            sectionTitle={`Concerts et DJ sets ${regionParam === 'pays-basque' ? 'au Pays Basque' : 'dans les Landes'}`}
          />
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-2 pb-4">
            {city.cities_related?.map((city) => {
              if (typeof city === 'string') {
                return null
              }
              return (
                <Link
                  href={`/concerts/${regionParam}/${city.slug}`}
                  key={city.id}
                  className="text-lg font-bold hover:text-white transition-all"
                >
                  {city.name}
                </Link>
              )
            })}
          </div> */}
        </div>
      </div>
    </>
  )
}

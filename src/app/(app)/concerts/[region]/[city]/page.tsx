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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; region: string }>
}) {
  const cityParam = (await params).city
  const regionParam = (await params).region
  const cityName = Array.isArray(cityParam) ? cityParam[0] : cityParam
  const formattedRegionName = regionParam.charAt(0).toUpperCase() + regionParam.slice(1)
  const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1)
  return {
    title: `Concerts et Soirées à ${formattedCityName} | Où Sortir ce Soir - Goazen!`,
    description: `Agenda des concerts et soirées à ${formattedCityName} : rock, électro, DJ sets. Découvrez la programmation des salles de concert au Pays Basque et dans les Landes.`,
    alternates: {
      canonical: `https://goazen.info/concerts/${regionParam}/${cityParam}`,
    },
    openGraph: {
      title: `Concerts et Soirées à ${formattedCityName} | Agenda Complet - Goazen!`,
      description: `Agenda des concerts et soirées à ${formattedCityName}. Découvrez tous les événements musicaux et trouvez votre prochaine sortie au Pays Basque ce soir !`,
      url: `https://goazen.info/concerts/${regionParam}/${cityParam}`,
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
  const [locations, city, cities, placeholderImage, events] = await Promise.all([
    getLocations({ cityName: cityParam, limit: 100 }),
    getCity(cityParam),
    getCities(regionParam),
    getPlaceholderImage(),
    getCachedEvents({
      city: cityParam,
      startDate: new Date().toISOString(),
    }),
  ])
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

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
        </div>
      </div>
    </>
  )
}

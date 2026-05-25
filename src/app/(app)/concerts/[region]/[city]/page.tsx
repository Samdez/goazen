import { Suspense } from 'react'
import { getCachedEvents } from '../../../queries/get-events'
import { getLocations } from '../../../queries/get-locations'
import { getPlaceholderImage } from '../../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { cn } from '@/lib/utils'
import { darkerGrotesque } from '../../../fonts'
import { getCity } from '../../../queries/get-city'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { CityFilterCombobox } from '@/app/(app)/components/CityFilterCombobox'
import { getCities } from '@/app/(app)/queries/get-cities'
import UnifiedFilterSections from '@/app/(app)/components/UnifiedFilterSection'
import EventsGrid from '@/app/(app)/components/EventsGrid'
import RelatedLocationsAndCities from '@/app/(app)/components/RelatedLocationsAndCities'
import type { City } from '@/payload-types'
import type { PaginatedDocs } from 'payload'
import { RichTextWrapper } from '@/app/(app)/components/RichTextWrapper'
import { JsonLd } from '@/app/(app)/components/JsonLd'
import { breadcrumbJsonLd, eventsItemListJsonLd } from '@/lib/structured-data'

export async function generateStaticParams() {
  const cities = await getCities()

  return cities.docs.map((city) => ({
    city: city.slug,
    region: city.region,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; region: string }>
}) {
  const { city: cityParam, region: regionParam } = await params
  const cityName = cityParam.charAt(0).toUpperCase() + cityParam.slice(1)
  const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1)
  const formattedRegionName = regionParam === 'pays-basque' ? 'Pays Basque' : 'Landes'
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
  searchParams,
}: {
  params: Promise<{ region: string; city: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { region, city } = await params
  const [cityData, placeholderImage, events, citiesData] = await Promise.all([
    getCity(city),
    getPlaceholderImage(),
    getCachedEvents({
      region,
      city,
      startDate: new Date().toISOString(),
    }),
    getCities(region),
  ])

  if (!cityData) {
    return null
  }

  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

  const regionName = region === 'pays-basque' ? 'Pays Basque' : 'Landes'
  const hasDescription = Boolean(cityData['rich text description'])
  const venueNames = Array.from(
    new Set(
      events.docs
        .map((event) =>
          typeof event.location === 'object' && event.location ? event.location.name : null,
        )
        .filter((name): name is string => Boolean(name)),
    ),
  ).slice(0, 6)
  const venueList = new Intl.ListFormat('fr', { type: 'conjunction' }).format(venueNames)

  return (
    <>
      <JsonLd
        id="city-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Concerts', path: '/concerts' },
          { name: regionName, path: `/concerts/${region}` },
          { name: cityData.name, path: `/concerts/${region}/${city}` },
        ])}
      />
      <JsonLd id="city-events" data={eventsItemListJsonLd(events.docs, { placeholderImage })} />

      <Suspense
        fallback={
          <div className="mx-auto mt-4 flex w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <UnifiedFilterSections
          title={`Concerts, soirées et DJ sets à ${cityData.name}`}
          subTitle={`Tous les concerts et soirées à venir à ${cityData.name}${
            region === 'pays-basque' ? ' (Pays Basque)' : ' (Landes)'
          }`}
          buttons={[
            <CityFilterCombobox
              key="city-filter"
              cities={citiesData.docs}
              isLocationsPage={false}
            />,
          ]}
        />
      </Suspense>
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
          placeholderImageUrl={placeholderImage}
          region={region}
        />
      </Suspense>
      <RelatedLocationsAndCities
        locations={citiesData}
        regionParam={region}
        city={cityData}
        sectionTitle={`Concerts et DJ sets ${
          region === 'pays-basque' ? 'au Pays Basque' : 'dans les Landes'
        }`}
      />
      {hasDescription ? (
        <RichTextWrapper data={cityData['rich text description']} className="px-6" />
      ) : (
        <section className={cn(darkerGrotesque.className, 'px-6 pb-8 text-lg text-gray-800')}>
          <p className="max-w-[70ch]">
            Retrouve tous les concerts, DJ sets et soirées à {cityData.name} ({regionName}).{' '}
            {venueNames.length > 0
              ? `Découvre la programmation des salles et lieux comme ${venueList}, mise à jour tous les jours.`
              : 'La programmation est mise à jour tous les jours pour ne rien manquer des prochaines sorties.'}
          </p>
        </section>
      )}
    </>
  )
}

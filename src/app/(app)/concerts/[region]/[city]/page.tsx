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
import Script from 'next/script'

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

  // Create structured data for the city and its events
  const cityStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: cityData.name,
    description: cityData['rich text description'],
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: region === 'pays-basque' ? 'Pays Basque' : 'Landes',
      containedInPlace: {
        '@type': 'Country',
        name: 'France',
      },
    },
    event: events.docs.map((event) => {
      const eventLocation =
        event.location && typeof event.location === 'object' ? event.location : null

      return {
        '@type': 'Event',
        name: event.title,
        startDate: event.date,
        endDate: event.date,
        description: event.description,
        image:
          typeof event.image === 'object' && event.image
            ? event.image.url?.startsWith('http')
              ? event.image.url
              : `https://goazen.info${event.image.url}`
            : `https://goazen.info${placeholderImage}`,
        location: eventLocation
          ? {
              '@type': 'Place',
              name: eventLocation.name,
              address: {
                '@type': 'PostalAddress',
                addressLocality: cityData.name,
                addressRegion: region === 'pays-basque' ? 'Pays Basque' : 'Landes',
                addressCountry: 'FR',
              },
            }
          : undefined,
        offers: event.ticketing_url
          ? {
              '@type': 'Offer',
              url: event.ticketing_url,
              availability: event.sold_out
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            }
          : undefined,
      }
    }),
  }

  return (
    <>
      <Script id="city-structured-data" type="application/ld+json">
        {JSON.stringify(cityStructuredData)}
      </Script>

      <Suspense
        fallback={
          <div className="mx-auto mt-4 flex w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <UnifiedFilterSections
          titleWithEffect
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
      <RichTextWrapper data={cityData['rich text description']} />
    </>
  )
}

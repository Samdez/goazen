import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getLocation } from '@/app/(app)/queries/get-location'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import { env } from 'env'
import RelatedLocationsAndCities from '@/app/(app)/components/RelatedLocationsAndCities'
import { getLocations } from '@/app/(app)/queries/get-locations'
import { getCity } from '@/app/(app)/queries/get-city'
import { RichTextWrapper } from '@/app/(app)/components/RichTextWrapper'
import Script from 'next/script'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; location: string; region: string }>
}) {
  const locationParam = (await params).location
  const regionParam = (await params).region
  const cityParam = (await params).city
  try {
    const location = await getLocation(locationParam)
    if (!location) {
      return {
        title: 'Not found',
        description: 'The page you are looking for does not exist',
      }
    }
    const cityName =
      typeof location['city V2'] === 'object' ? location['city V2']?.name : location.city

    const description =
      location.meta?.description ||
      `Découvrez la programmation complète des concerts et soirées à ${location.name}, ${location.city}. Agenda des événements, DJ sets, et infos pratiques. Le meilleur des concerts et soirées au Pays Basque. Réservez vos places dès maintenant !`
    const title =
      location.meta?.title ||
      `Concerts à ${location.name} ${cityName} | Programme & Billetterie - Goazen!`

    const locationImage =
      typeof location.image !== 'string' &&
      typeof location.image?.url === 'string' &&
      location.image?.url

    return {
      title,
      description,
      alternates: {
        canonical: `https://goazen.info/concerts/${regionParam}/${cityParam}/${locationParam}`,
      },
      openGraph: {
        title,
        description,
        url: `https://goazen.info/concerts/${regionParam}/${cityParam}/${locationParam}`,
        siteName: 'Goazen!',
        images: locationImage
          ? [
              {
                url: locationImage,
                width: 1200,
                height: 630,
                alt: `Concerts à ${location.name} ${location.city}`,
              },
            ]
          : undefined,
        locale: 'fr_FR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: locationImage ? [locationImage] : undefined,
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
  } catch (error) {
    return {
      title: 'Not found',
      description: 'The page you are looking for does not exist',
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export async function generateStaticParams() {
  const locations = await getLocations({ limit: 100 })

  return locations.docs
    .map((location) => {
      const cityData = typeof location['city V2'] === 'object' ? location['city V2'] : null
      const region = cityData?.region || 'pays-basque' // default to pays-basque if no region specified
      const city = cityData?.slug || location.city

      return {
        region,
        city,
        location: location.slug,
      }
    })
    .filter((params) => params.region && params.city && params.location)
}

async function LocationPage({
  params,
}: {
  params: Promise<{ city: string; location: string; region: string }>
}) {
  const { location: locationParam, region: regionParam, city: cityParam } = await params
  const [location, city, relatedLocations, placeholderImageUrl] = await Promise.all([
    getLocation(locationParam),
    getCity(cityParam),
    getLocations({
      cityName: cityParam,
      limit: 100,
    }),
    getPlaceholderImage(),
  ])
  const events = await getCachedEvents({
    locationId: location.id,
    startDate: new Date().toISOString(),
  })
  const cityName =
    typeof location['city V2'] === 'object' ? location['city V2']?.name : location.city

  const imageUrl =
    !(typeof location?.image === 'string') && location.image ? location.image?.url : ''

  const description = location.description_V2 || location.description

  // Create structured data for the music venue
  const venueStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicVenue',
    name: location.name,
    description: description,
    image: imageUrl || placeholderImageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: regionParam === 'pays-basque' ? 'Pays Basque' : 'Landes',
      addressCountry: 'FR',
    },
    geo: location.place_id
      ? {
          '@type': 'GeoCoordinates',
          // You might want to add latitude and longitude if you have them
        }
      : undefined,
    // Add upcoming events
    event: events.docs.map((event) => {
      const isPastEvent = new Date(event.date) < new Date()

      return {
        '@type': 'MusicEvent',
        name: event.title,
        startDate: event.date,
        endDate: event.date,
        description: event.description,
        image: typeof event.image === 'object' ? event.image?.url : undefined,
        eventStatus: isPastEvent
          ? 'https://schema.org/EventScheduled'
          : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        // Add performer information if available
        performer: event.category
          ?.map((cat) =>
            typeof cat === 'object'
              ? {
                  '@type': 'MusicGroup',
                  name: cat.name,
                  genre: cat.slug,
                }
              : undefined,
          )
          .filter(Boolean),
        // Add music-specific details
        musicType: event.category
          ?.map((cat) => (typeof cat === 'object' ? cat.name : undefined))
          .filter(Boolean)
          .join(', '),
        location: {
          '@type': 'MusicVenue',
          name: location.name,
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityName,
            addressRegion: regionParam === 'pays-basque' ? 'Pays Basque' : 'Landes',
            addressCountry: 'FR',
          },
        },
        offers: event.ticketing_url
          ? {
              '@type': 'Offer',
              url: event.ticketing_url,
              availability:
                isPastEvent || event.sold_out
                  ? 'https://schema.org/SoldOut'
                  : 'https://schema.org/InStock',
              validFrom: event.createdAt || event.date,
              ...(event.price && {
                price: event.price,
                priceCurrency: 'EUR',
              }),
            }
          : undefined,
      }
    }),
    // Add venue-specific details
    publicAccess: true,
    smokingAllowed: false,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday'], // Add actual opening days if you have them
      opens: '20:00',
      closes: '02:00',
    },
    // Add organization information
    parentOrganization: {
      '@type': 'Organization',
      name: 'Goazen!',
      url: 'https://goazen.info',
    },
  }

  return (
    <>
      <Script id="venue-structured-data" type="application/ld+json">
        {JSON.stringify(venueStructuredData)}
      </Script>

      <div className="flex flex-col items-center gap-4 px-4 py-8">
        <h1 className="text-center text-4xl font-bold text-black">
          Tous les concerts, DJ sets, et soirées à {location.name} {cityName} :
        </h1>
        {events.docs.length ? (
          <EventsCarousel events={events.docs} placeholderImageUrl={placeholderImageUrl || ''} />
        ) : (
          <div className="flex h-36 items-center">
            <p className="text-4l text-black">Rien de prévu ici à notre connaissance...😔</p>
          </div>
        )}
        {imageUrl && (
          <Image
            className="mx-auto"
            src={imageUrl || ''}
            alt={location.name}
            width={640}
            height={640}
          />
        )}
        {description && <RichTextWrapper data={description} />}

        <div className="flex w-full justify-center py-8">
          <iframe
            width="100%"
            height="450"
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/place?q=place_id:${location.place_id}&key=${env.GOOGLE_MAPS_API_KEY}`}
          ></iframe>
        </div>
        <RelatedLocationsAndCities
          locations={relatedLocations}
          regionParam={regionParam}
          city={city}
          sectionTitle={`Les autres lieux de concerts, soirées et DJ sets à ${cityName} :`}
        />
      </div>
    </>
  )
}

export default LocationPage

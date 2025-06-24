import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getLocation } from '@/app/(app)/queries/get-location'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import { env } from 'env'
import RelatedLocations from '@/app/(app)/components/RelatedLocations'
import { getLocations } from '@/app/(app)/queries/get-locations'
import { getCity } from '@/app/(app)/queries/get-city'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; location: string }>
}) {
  const locationParam = (await params).location
  try {
    const location = await getLocation(locationParam)
    if (!location) {
      return {
        title: 'Not found',
        description: 'The page you are looking for does not exist',
      }
    }

    const description =
      location.meta?.description ||
      `Découvrez la programmation complète des concerts et soirées à ${location.name}, ${location.city}. Agenda des événements, DJ sets, et infos pratiques. Le meilleur des concerts et soirées au Pays Basque. Réservez vos places dès maintenant !`
    const title =
      location.meta?.title ||
      `Concerts à ${location.name} ${location.city} | Programme & Billetterie - Goazen!`

    const locationImage =
      typeof location.image !== 'string' &&
      typeof location.image?.url === 'string' &&
      location.image?.url

    return {
      title,
      description,
      alternates: {
        canonical: `https://goazen.info/concerts/${location.city}/${location.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://goazen.info/concerts/${location.city}/${location.slug}`,
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

async function LocationPage({
  params,
}: {
  params: Promise<{ city: string; location: string; region: string }>
}) {
  const { location: locationParam, region: regionParam, city: cityParam } = await params
  const [location, city, relatedLocations, events, placeholderImageUrl] = await Promise.all([
    getLocation(locationParam),
    getCity(cityParam),
    getLocations({
      cityName: cityParam,
      limit: 100,
    }),
    getCachedEvents({
      locationId: locationParam,
      startDate: new Date().toISOString(),
    }),
    getPlaceholderImage(),
  ])
  const cityName =
    typeof location['city V2'] === 'string' ? location['city V2'] : location['city V2']?.name
  const imageUrl =
    !(typeof location?.image === 'string') && location.image ? location.image?.url : ''

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-center text-6xl font-bold text-black">{location.name}</h1>
      <h3 className="text-4xl text-black">Prochains concerts: </h3>
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
      {location.description && (
        <RichText data={location.description} className="text-black font-text" />
      )}

      <div className="flex w-full justify-center py-8">
        <iframe
          width="100%"
          height="450"
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?q=place_id:${location.place_id}&key=${env.GOOGLE_MAPS_API_KEY}`}
        ></iframe>
      </div>
      <RelatedLocations
        locations={relatedLocations}
        regionParam={regionParam}
        city={city}
        sectionTitle={`Les autres lieux de concerts, soirées et DJ sets à ${city.name} :`}
      />
    </div>
  )
}

export default LocationPage

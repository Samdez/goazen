import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getLocation } from '@/app/(app)/queries/get-location'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import { env } from 'env'

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

async function LocationPage({ params }: { params: Promise<{ city: string; location: string }> }) {
  const { location: locationParam } = await params
  const location = await getLocation(locationParam)
  const { docs: events } = await getCachedEvents({
    locationId: location.id,
    startDate: new Date().toISOString(),
  })
  const placeholderImageUrl = await getPlaceholderImage()
  const imageUrl =
    !(typeof location?.image === 'string') && location.image ? location.image?.url : ''

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8 text-white">
      <h1 className="text-center text-6xl font-bold text-black">{location.name}</h1>
      <h2 className="text-4xl text-black">Prochains concerts: </h2>
      {events.length ? (
        <EventsCarousel events={events} placeholderImageUrl={placeholderImageUrl || ''} />
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
      {location.description && <RichText data={location.description} className="text-black" />}

      <div className="flex w-full justify-center py-8">
        <iframe
          width="600"
          height="450"
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?q=place_id:${location.place_id}&key=${env.GOOGLE_MAPS_API_KEY}`}
        ></iframe>
      </div>
    </div>
  )
}

export default LocationPage

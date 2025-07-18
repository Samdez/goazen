import Image from 'next/image'
import Link from 'next/link'
import { cn, formatDate, getLocationInfo, slugifyString } from '@/utils'
import { Button } from '@/components/ui/button'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getEvent } from '@/app/(app)/queries/get-event'
import { payload } from '@/app/(app)/(client)/payload-client'
import { darkerGrotesque } from '@/app/(app)/fonts'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import Script from 'next/script'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slugParam = (await params).slug
  try {
    const event = await getEvent(slugParam.split('_').reverse()[0])
    const locationInfo = getLocationInfo(event)
    if (!event) {
      return {
        title: 'Not found',
        description: 'The page you are looking for does not exist',
      }
    }

    const date = new Date(event.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Paris',
    })

    const isPastEvent = new Date(event.date) < new Date()

    const title =
      event.meta?.title ||
      `${event.title} ${isPastEvent ? '(Archive) ' : ''}en Concert à ${
        locationInfo?.cityName && locationInfo?.cityName
      } le ${date} | Goazen!`
    const description =
      event.meta?.description ||
      `${event.title} ${isPastEvent ? '(Archive) ' : ''}en concert à ${
        locationInfo?.cityName && locationInfo?.cityName
      } le ${date}. ${event.description || ''} ${
        isPastEvent
          ? 'Retrouvez les archives des concerts passés à ' + locationInfo?.locationName
          : 'Réservez vos places pour ce concert live au Pays Basque.'
      }`

    const imageUrl =
      !(typeof event.image === 'string') && event.image ? event.image?.url : undefined

    // Ensure we have a fully qualified URL for metadata
    const fullImageUrl = imageUrl?.startsWith('http')
      ? imageUrl
      : imageUrl
        ? `https://goazen.info${imageUrl}`
        : undefined

    return {
      title,
      description,
      alternates: {
        canonical: `https://goazen.info/concerts/${locationInfo?.region}/${locationInfo?.citySlug}/${locationInfo?.locationSlug}/${event.slug}_${event.id}`,
      },
      openGraph: {
        title,
        description,
        url: `https://goazen.info/concerts/${locationInfo?.region}/${locationInfo?.citySlug}/${locationInfo?.locationSlug}/${event.slug}_${event.id}`,
        siteName: 'Goazen!',
        images: fullImageUrl
          ? [
              {
                url: fullImageUrl,
                width: 1200,
                height: 630,
                alt: `${event.title} ${isPastEvent ? '(Archive) ' : ''}en concert à ${
                  locationInfo?.cityName && locationInfo?.cityName
                } ${locationInfo?.locationName && locationInfo?.locationName}`,
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
        images: fullImageUrl ? [fullImageUrl] : undefined,
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
  const events = await payload.find({
    collection: 'events',
    depth: 2, // Increase depth to get nested location data
    limit: 100,
  })

  return events.docs
    .map((event) => {
      const locationInfo = getLocationInfo(event)

      return {
        city: locationInfo?.citySlug || '',
        location: locationInfo?.locationSlug || '',
        slug: [`${event.slug}_${event.id}`],
      }
    })
    .filter((params) => params.city && params.location) // Filter out any invalid params
}

async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const slugParam = (await params).slug

  const event = await getEvent(slugParam.split('_').reverse()[0])
  const [locationEvents, placeholderImage] = await Promise.all([
    event.location &&
      getCachedEvents({
        locationId: typeof event.location === 'string' ? event.location : event.location?.id,
        startDate: new Date().toISOString(),
      }),
    getPlaceholderImage(),
  ])
  const otherEvents = locationEvents !== '' && locationEvents?.docs.filter((e) => e.id !== event.id)

  const imageUrl =
    !(typeof event.image === 'string') && event.image ? event.image?.url : placeholderImage

  // Ensure we have a fully qualified URL for structured data
  const fullImageUrl = imageUrl?.startsWith('http') ? imageUrl : `https://goazen.info${imageUrl}`

  const locationInfo = getLocationInfo(event)

  const isPastEvent = new Date(event.date) < new Date()

  // Create structured data for the music event
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    startDate: event.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: event.description,
    image: fullImageUrl,
    // Add performer information if available in categories
    performer: event.category
      ?.map((cat) =>
        typeof cat === 'object'
          ? {
              '@type': 'MusicGroup',
              name: cat.name,
              genre: cat.slug, // Using slug as genre identifier
            }
          : undefined,
      )
      .filter(Boolean),
    // Add music-specific details
    musicType:
      event.category && event.category.length > 0
        ? event.category
            ?.map((cat) => (typeof cat === 'object' ? cat.name : undefined))
            .filter(Boolean)
            .join(', ')
        : event.genres,
    // Add venue information
    location:
      typeof event.location === 'object' && event.location
        ? {
            '@type': 'MusicVenue',
            name: event.location.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: locationInfo?.cityName,
              addressRegion: locationInfo?.region === 'pays-basque' ? 'Pays Basque' : 'Landes',
              addressCountry: 'FR',
            },
          }
        : {
            '@type': 'MusicVenue',
            name: event.location_alt,
          },
    // Add offer information
    offers: event.ticketing_url
      ? {
          '@type': 'Offer',
          url: event.ticketing_url,
          availability:
            isPastEvent || event.sold_out
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          validFrom: event.createdAt || event.date,
          // Add price if available
          ...(event.price && {
            price: event.price,
            priceCurrency: 'EUR',
          }),
        }
      : undefined,
  }

  return (
    <>
      <Script id="event-structured-data" type="application/ld+json">
        {JSON.stringify(eventStructuredData)}
      </Script>

      <div className="flex flex-col items-center gap-4 text-white">
        {isPastEvent && (
          <div className="w-full bg-gray-800 text-white py-2 px-4 text-center">
            <p className="text-lg">Cet événement est passé</p>
          </div>
        )}
        <h1 className="text-center text-6xl font-bold text-black px-4">{event.title}</h1>
        <div
          className={cn(
            'rounded-lg border-4 border-black p-2 text-2xl text-white',
            isPastEvent ? 'bg-gray-600' : 'bg-[#E45110]',
          )}
        >
          <p className="font-semibold">
            {formatDate(event.date)} - {event.time}
          </p>
        </div>
        <div>
          {event.location ? (
            <Link
              href={`/concerts/${locationInfo?.region}/${locationInfo?.citySlug}/${locationInfo?.locationSlug}`}
              className="rounded-md p-2 text-center text-4xl font-bold text-black hover:bg-black hover:text-[#FFF2DD]"
            >
              {locationInfo?.locationName}
            </Link>
          ) : (
            <p className="rounded-md p-2 text-center text-4xl font-bold text-black">
              {locationInfo?.locationName}
            </p>
          )}
        </div>
        <Image
          className="mx-auto"
          src={imageUrl || ''}
          alt={event.title}
          width={640}
          height={640}
          unoptimized
        />
        {event.description && (
          <div className="rounded-lg border-4 border-black bg-white px-6 py-4 text-2xl text-black lg:w-1/2 mx-6 mb-6">
            <p className={cn(darkerGrotesque.className, 'text-lg text-black')}>
              {event.description}
            </p>
          </div>
        )}
        {isPastEvent ? (
          <div className="rounded-lg border-4 border-black bg-gray-600 p-2 text-2xl text-white">
            Événement terminé
          </div>
        ) : event.sold_out ? (
          <Button className="pointer-events-none rounded-lg border-4 border-black bg-[#E45110] p-2 text-2xl text-black">
            Complet 😢
          </Button>
        ) : (
          event.ticketing_url && (
            <a href={`${event.ticketing_url}`} target="_blank">
              <Button className="rounded-lg border-4 border-black bg-[#E45110] p-2 text-2xl text-black">
                Billetterie
              </Button>
            </a>
          )
        )}
        {otherEvents && otherEvents.length > 0 && (
          <div className="flex flex-col items-center gap-4 px-4 py-8 text-white w-full">
            <h2 className="text-center text-6xl font-bold text-black">
              {locationInfo?.locationName}
            </h2>
            <h2 className="text-4xl text-black">Prochains concerts: </h2>
            <EventsCarousel events={otherEvents} placeholderImageUrl={placeholderImage || ''} />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 px-4 pb-8 text-white">
          {event.category && event.category.length > 0 && (
            <Button className="rounded-lg border-4 border-black bg-[#E45110] p-2 text-2xl text-black">
              <Link
                href={`/genres/${
                  typeof event.category?.[0] === 'string'
                    ? event.category?.[0]
                    : event.category?.[0]?.slug
                }`}
                className="text-2xl text-black"
              >
                Tous les concerts{' '}
                {typeof event.category?.[0] === 'string'
                  ? event.category?.[0]
                  : event.category?.[0]?.name}
              </Link>
            </Button>
          )}
          {event.location && (
            <Button className="rounded-lg border-4 border-black bg-[#E45110] p-2 text-2xl text-black">
              <Link
                href={`/concerts/${locationInfo?.region}/${locationInfo?.citySlug}`}
                className="text-2xl text-black"
              >
                Tous les concerts à {locationInfo?.cityName}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default EventPage

import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cn, formatDate, getLocationInfo, isEventPast, slugifyString } from '@/utils'
import { buildEventSEODescription, buildEventSEOTitle } from '@/config-utils'
import { getEventKindBadgeClassName, getEventKindLabel, hasEventKind } from '@/utils/event-kind'
import { Button } from '@/components/ui/button'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getEvent } from '@/app/(app)/queries/get-event'
import { payload } from '@/app/(app)/(client)/payload-client'
import { darkerGrotesque } from '@/app/(app)/fonts'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import { JsonLd } from '@/app/(app)/components/JsonLd'
import { eventJsonLd } from '@/lib/structured-data'
import { formatEventGenres, primaryEventCategory } from '@/lib/format-event'

// ISR: re-render periodically so the "upcoming events" filter (new Date())
// isn't frozen at build time.
export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; city: string; location: string; slug: string }>
}): Promise<Metadata> {
  const { region, city, location, slug } = await params
  const canonical = `https://goazen.info/concerts/${region}/${city}/${location}/${slug}`

  try {
    const event = await getEvent(slug.split('_').reverse()[0])
    if (!event) {
      return {
        title: 'Événement introuvable | Goazen!',
        description: "L'événement que vous recherchez n'existe pas.",
        robots: { index: false, follow: false },
      }
    }

    // plugin-seo meta wins only when both fields are filled; otherwise fall back
    // to the shared builders used by payload.config.ts.
    const metaTitle = event.meta?.title?.trim()
    const metaDescription = event.meta?.description?.trim()
    const hasSeoMeta = Boolean(metaTitle && metaDescription)

    // buildEventSEO* expect location as an id (payload.findByID), but getEvent
    // populates it — normalise before delegating.
    const seoDoc = {
      ...event,
      location:
        typeof event.location === 'object' && event.location
          ? event.location.id
          : event.location,
    }

    const title = hasSeoMeta ? (metaTitle as string) : await buildEventSEOTitle(seoDoc)
    const description = (
      hasSeoMeta ? (metaDescription as string) : await buildEventSEODescription(seoDoc)
    ).slice(0, 155)

    const eventDate = new Date(event.date)
    const isStaleEvent = eventDate.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000

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
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Goazen!',
        images: fullImageUrl
          ? [{ url: fullImageUrl, width: 1200, height: 630, alt: event.title }]
          : undefined,
        locale: 'fr_FR',
        type: 'website',
      },
      robots: {
        index: !isStaleEvent,
        follow: true,
        googleBot: {
          index: !isStaleEvent,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    return {
      title: 'Événement introuvable | Goazen!',
      description: "L'événement que vous recherchez n'existe pas.",
      robots: { index: false, follow: false },
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

  const locationInfo = getLocationInfo(event)

  const isPastEvent = isEventPast(event.date)
  const genres = formatEventGenres(event)
  const genreLink = primaryEventCategory(event)

  return (
    <>
      <JsonLd
        id="event-structured-data"
        data={eventJsonLd(event, { placeholderImage: placeholderImage || undefined })}
      />

      <div className="flex flex-col items-center gap-4 text-white">
        {isPastEvent && (
          <div className="w-full bg-gray-800 text-white py-2 px-4 text-center">
            <p className="text-lg">Cet événement est passé</p>
          </div>
        )}
        <h1 className="text-center text-6xl font-bold text-black px-4">{event.title}</h1>
        {hasEventKind(event) && (
          <div className="flex justify-center px-4">
            <span
              className={cn(
                'inline-block rounded-md border-4 border-black px-4 py-1 text-lg font-bold uppercase tracking-wide',
                getEventKindBadgeClassName(event.event_kind),
              )}
            >
              {getEventKindLabel(event.event_kind)}
            </span>
          </div>
        )}
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
        {genres && (
          <p
            className={cn(
              darkerGrotesque.className,
              'px-4 text-center text-2xl font-bold uppercase tracking-wide text-black',
            )}
          >
            {genres}
          </p>
        )}
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
          {event.special_event &&
            typeof event.special_event === 'object' &&
            event.special_event.slug && (
              <Button className="rounded-lg border-4 border-black bg-[#E45110] p-2 text-2xl text-black">
                <Link
                  href={`/concerts/evenement/${event.special_event.slug}`}
                  className="text-2xl text-black"
                >
                  Voir tous les concerts de la {event.special_event.name}
                </Link>
              </Button>
            )}
          {genreLink?.slug && (
            <Button className="rounded-lg border-4 border-black bg-[#E45110] p-2 text-2xl text-black">
              <Link href={`/genres/${genreLink.slug}`} className="text-2xl text-black">
                Tous les concerts {genreLink.name}
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

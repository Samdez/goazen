import Image from 'next/image'
import Link from 'next/link'
import { cn, formatDate, slugifyString } from '@/utils'
import { Button } from '@/components/ui/button'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getEvent } from '@/app/(app)/queries/get-event'
import { payload } from '@/app/(app)/client/payload-client'
import { darkerGrotesque } from '@/app/(app)/fonts'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import Listing from '@/app/(app)/components/Listing'
import { getCategories } from '@/app/(app)/queries/get-categories'

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const slugParam = (await params).slug
  try {
    const event = await getEvent(slugParam[0].split('_').reverse()[0])
    const locationCity =
      !(typeof event.location === 'string') && event.location?.city?.toLowerCase()
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
    })

    const locationName = !(typeof event.location === 'string') ? event.location?.name || '' : ''
    const title =
      event.meta?.title ||
      `${event.title} en Concert à ${locationName} ${locationCity} le ${date} | Goazen!`
    const description =
      event.meta?.description ||
      `${event.title} en concert à ${locationName} ${locationCity} le ${date}. ${event.description || ''} Réservez vos places pour ce concert live au Pays Basque.`

    const imageUrl =
      !(typeof event.image === 'string') && event.image ? event.image?.url : undefined

    return {
      title,
      description,
      alternates: {
        canonical: `https://goazen.info/concerts/${locationCity}/${event.slug}_${event.id}`,
      },
      openGraph: {
        title,
        description,
        url: `https://goazen.info/concerts/${locationCity}/${event.slug}_${event.id}`,
        siteName: 'Goazen!',
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: `${event.title} en concert à ${locationName} ${locationCity}`,
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
        images: imageUrl ? [imageUrl] : undefined,
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
      const locationCity =
        !(typeof event.location === 'string') && event.location?.city?.toLowerCase()
      const locationName = !(typeof event.location === 'string') && event.location?.name

      return {
        city: locationCity || '',
        location: slugifyString(locationName || ''),
        slug: [`${event.slug}_${event.id}`],
      }
    })
    .filter((params) => params.city && params.location) // Filter out any invalid params
}

async function EventPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const slugParam = await params
  const event = await getEvent(slugParam.slug[0].split('_').reverse()[0])
  const locationEvents =
    event.location &&
    (await getCachedEvents({
      locationId: typeof event.location === 'string' ? event.location : event.location?.id,
      startDate: new Date().toISOString(),
    }))
  const placeholderImage = await getPlaceholderImage()

  const imageUrl =
    !(typeof event.image === 'string') && event.image ? event.image?.url : placeholderImage
  const locationName = !(typeof event.location === 'string') ? event.location?.name || '' : ''
  const locationCity = !(typeof event.location === 'string') ? event.location?.city : ''
  console.log(event)

  return (
    <div className="flex flex-col items-center  gap-4 text-white">
      <h1 className="text-center text-6xl font-bold text-black">{event.title}</h1>
      <div className="rounded-lg border-4 border-black bg-[#ee2244bc] p-2 text-2xl text-black">
        <p className="font-semibold">
          {formatDate(event.date)} - {event.time}
        </p>
      </div>
      <div>
        <Link
          href={`/concerts/${locationCity}/${slugifyString(locationName)}`}
          className="rounded-md p-2 text-center text-4xl font-bold text-black hover:bg-black hover:text-[#FFDCA8]"
        >
          {locationName}
        </Link>
      </div>
      <Image className="mx-auto" src={imageUrl || ''} alt={event.title} width={640} height={640} />
      {event.description && (
        <div className="rounded-lg border-4 border-black bg-white px-6 py-4 text-2xl text-black lg:w-1/2 mx-6 mb-6">
          <p className={cn(darkerGrotesque.className, 'text-lg text-black')}>{event.description}</p>
        </div>
      )}
      {event.sold_out ? (
        <Button className="pointer-events-none rounded-lg border-4 border-black bg-[#ee2244bc] p-2 text-2xl text-black">
          Complet 😢
        </Button>
      ) : (
        event.ticketing_url && (
          <a href={`${event.ticketing_url}`} target="_blank">
            <Button className="rounded-lg border-4 border-black bg-[#ee2244bc] p-2 text-2xl text-black">
              Billetterie
            </Button>
          </a>
        )
      )}
      {locationEvents && locationEvents.docs.length > 0 && (
        <div className="flex flex-col items-center gap-4 px-4 py-8 text-white">
          <h1 className="text-center text-6xl font-bold text-black">{locationName}</h1>
          <h2 className="text-4xl text-black">Prochains concerts: </h2>
          <EventsCarousel
            events={locationEvents.docs}
            placeholderImageUrl={placeholderImage || ''}
          />
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-8 text-white">
        {event.category && (
          <Button className="rounded-lg border-4 border-black bg-[#ee2244bc] p-2 text-2xl text-black">
            <Link
              href={`/genres/${typeof event.category?.[0] === 'string' ? event.category?.[0] : event.category?.[0]?.slug}`}
              className="text-2xl text-black"
            >
              Tous les concerts{' '}
              {typeof event.category?.[0] === 'string'
                ? event.category?.[0]
                : event.category?.[0]?.name}
            </Link>
          </Button>
        )}
        {locationCity && (
          <Button className="rounded-lg border-4 border-black bg-[#ee2244bc] p-2 text-2xl text-black">
            <Link href={`/concerts/${locationCity}`} className="text-2xl text-black">
              Tous les concerts à {locationCity}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default EventPage

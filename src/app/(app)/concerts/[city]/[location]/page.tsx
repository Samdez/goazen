import Image from 'next/image'
import { Node } from 'slate'
import { getEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getLocation } from '@/app/(app)/queries/get-location'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import { serializeRichText } from '@/lib/serialize-rich-text'
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
    return {
      title: location.name,
      description: generateMetaDescription(location.description as unknown as Node[]),
      alternates: {
        canonical: `/concerts/${location.city}/${location.slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Not found',
      description: 'The page you are looking for does not exist',
    }
  }
}

const generateMetaDescription = (nodes: Node[]) => {
  return nodes.map((n) => Node.string(n)).join('\n')
}

async function LocationPage({ params }: { params: Promise<{ city: string; location: string }> }) {
  const { location: locationParam } = await params
  const location = await getLocation(locationParam)
  const { docs: events } = await getEvents({
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
      <div>{location.description && serializeRichText(location.description)}</div>
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
import Image from 'next/image'
import Link from 'next/link'
import { slugifyString } from '@/lib/utils'
import { fetchPlaceholderImage, getEvent } from '@/src/app/queries'

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
    return {
      title: event.title,
      description: event.description,
      alternates: {
        canonical: `/concerts/${locationCity}/${event.slug}_${event.id}`,
      },
    }
  } catch (error) {
    return {
      title: 'Not found',
      description: 'The page you are looking for does not exist',
    }
  }
}

async function EventPage({ params }: { params: { slug: string[] } }) {
  const event = await getEvent(params.slug[0].split('_').reverse()[0])
  const placeholderImage = await fetchPlaceholderImage()

  const imageUrl =
    !(typeof event.image === 'string') && event.image
      ? event.image?.url
      : placeholderImage.ImagePlaceholder.url
  const imageTitle = !(typeof event.image === 'string') && event.image ? event.image?.title : ''
  const locationName = !(typeof event.location === 'string') ? event.location?.name || '' : ''
  const locationCity = !(typeof event.location === 'string') ? event.location?.city : ''

  return (
    <div className="flex flex-col items-center  gap-4 text-white">
      <h1 className="text-center text-6xl font-bold text-black">{event.title}</h1>
      <div className="rounded-lg border-4 border-black bg-[#ee2244bc] p-2 text-2xl text-black">
        <p className="font-semibold">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
      </div>
      <div>
        <Link
          href={`/concerts/${locationCity}/${slugifyString(locationName)}`}
          className="rounded-md p-2 text-center text-4xl font-bold text-black hover:bg-black hover:text-[#FFDCA8]"
        >
          {locationName}
        </Link>
      </div>
      <Image className="mx-auto" src={imageUrl || ''} alt={imageTitle} width={640} height={640} />
      <p className="p-12 font-['Public_Sans'] text-lg text-black">{event.description}</p>
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
    </div>
  )
}

export default EventPage

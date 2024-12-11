import { Event } from '@/payload-types'
import { buildEventUrl, formatDate } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/card'
import slugify from 'slugify'

function EventThumbnail({
  event,
  placeholderImageUrl,
}: {
  event: Event
  placeholderImageUrl: string
}) {
  const imageUrl =
    !(typeof event.image === 'string') && event.image ? event.image?.url : placeholderImageUrl
  const imageTitle = !(typeof event.image === 'string') && event.image ? event.image?.title : ''
  const eventPrice = event.sold_out
    ? 'Complet'
    : event.price === '0'
      ? 'Gratuit'
      : event.price
        ? `${event.price} €`
        : 'N/A'

  const eventUrl = buildEventUrl(event)
  const locationName = event.location
    ? !(typeof event.location === 'string') && event.location?.name
    : slugify(event.location_alt?.split(/[-/,]/)?.at(0) || 'no-location')
  const locationCity = event.location
    ? !(typeof event.location === 'string') && event.location?.city
    : slugify(event.location_alt?.split(/[-/,]/)?.at(1) || 'no-location')

  return (
    <Card className="relative h-[360px] rounded-xl border-black shadow-[15px_15px_0px_0px_rgba(0,0,0)]">
      <Link href={eventUrl} className="rounded-xl">
        <CardContent className="rounded-xl border-4 border-black px-0 py-0">
          <CardHeader className="h-44 px-2 py-4">
            <span className="text-xl text-[#ee2244bc]">{formatDate(event.date)}</span>
            <span className="pl-2">{event.time}</span>
            <CardTitle className="text-md text-balance text-2xl">{event.title}</CardTitle>
            <CardDescription className="text-md items-center justify-center rounded-md border-black font-['Public_Sans'] ">
              {locationCity ? (
                <>
                  <span className="text-[#ee2244bc]">{locationName}</span> / {locationCity}
                </>
              ) : (
                event.location_alt
              )}
            </CardDescription>
            {event.genres && (
              <CardDescription className="text-md items-center justify-center rounded-md border-black font-['Public_Sans'] text-black">
                {event.genres}
              </CardDescription>
            )}
          </CardHeader>
          <div className="relative flex h-[176px] w-full justify-center">
            <Image
              alt={imageTitle}
              src={imageUrl || ''}
              fill
              sizes="176px"
              className="rounded-b-md object-cover"
              priority
            />
            <div className="absolute bottom-4 right-4 flex h-6 min-w-14 items-center justify-center rounded-md bg-white px-2">
              {eventPrice}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default EventThumbnail

import { Event } from '@/payload-types'
import { buildEventUrl, cn, formatDate } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/card'
import { darkerGrotesque } from '../fonts'

function EventThumbnail({
  event,
  placeholderImageUrl,
  className,
}: {
  event: Event
  placeholderImageUrl: string
  className?: string
}) {
  const imageUrl =
    !(typeof event.image === 'string') && event.image ? event.image?.url : placeholderImageUrl
  const eventPrice = event.sold_out
    ? 'Complet'
    : event.price === '0'
      ? 'Gratuit'
      : event.price
        ? event.price.split('').includes('€')
          ? `${event.price}`
          : `${event.price} €`
        : 'N/A'

  const eventUrl = buildEventUrl(event)
  const locationName = !(typeof event.location === 'string') ? event.location?.name : ''
  const getLocationCity = () => {
    if (!event.location) {
      return
    }

    if (typeof event.location === 'string') {
      return null
    }

    if (typeof event.location['city V2'] === 'object' && event.location['city V2']?.name) {
      return event.location['city V2'].name
    }

    return event.location.city
  }
  const locationCity = getLocationCity()

  return (
    <Card
      className={cn(
        'relative aspect-[302/360] rounded-xl border-black shadow-[15px_15px_0px_0px_rgba(0,0,0)]',
        className,
      )}
    >
      <Link href={eventUrl} className="rounded-xl h-full">
        <CardContent className="rounded-xl border-4 border-black px-0 py-0 h-full">
          <CardHeader className="h-[45%] px-2 py-4">
            <span className="text-xl text-[#E45110]">{formatDate(event.date)}</span>
            <span className="pl-2">{event.time}</span>
            <CardTitle className="text-md text-balance text-2xl">{event.title}</CardTitle>
            <CardDescription className="text-md items-center justify-center rounded-md border-black">
              <span className={cn(darkerGrotesque.className, 'text-[#E45110] text-xl font-bold')}>
                {event.location ? `${locationName} / ${locationCity}` : event.location_alt}
              </span>
            </CardDescription>
            {event.genres && (
              <CardDescription className="text-md items-center justify-center rounded-md border-black text-black">
                {event.genres}
              </CardDescription>
            )}
          </CardHeader>
          <div className="relative flex h-[55%] w-full justify-center">
            <Image
              alt={event.title}
              src={imageUrl || ''}
              fill
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

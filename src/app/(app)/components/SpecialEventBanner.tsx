import { SpecialEvent } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { getEvent } from '../queries/get-event'
import { buildEventUrl, formatDate } from '@/utils'

export default async function SpecialEventBanner({ event }: { event: SpecialEvent }) {
  const isSingleEvent = event.events?.docs?.length === 1
  let eventUrl = ''
  let singleEvent = null
  if (isSingleEvent) {
    singleEvent = await getEvent(event.events?.docs?.[0] as string)
    eventUrl = buildEventUrl(singleEvent)
  } else {
    eventUrl = `/concerts/evenement/${event.slug}`
  }

  const desktopUrl = event.image && typeof event.image === 'object' ? event.image.url : null
  const mobileUrl =
    event.image_mobile && typeof event.image_mobile === 'object'
      ? event.image_mobile.url
      : desktopUrl

  return (
    <div className="w-full mb-4">
      <Link
        className="group relative h-32 flex flex-col items-center justify-center overflow-hidden rounded-xl w-full bg-[#E45110] text-white drop-shadow-xl"
        href={eventUrl}
      >
        {desktopUrl && (
          <>
            {mobileUrl && (
              <Image
                alt={event.name}
                src={mobileUrl}
                fill
                sizes="100vw"
                className="object-cover md:hidden"
                unoptimized
              />
            )}
            <Image
              alt={event.name}
              src={desktopUrl}
              fill
              sizes="100vw"
              className="hidden object-cover md:block"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/50 transition-colors group-hover:bg-black/60" />
          </>
        )}
        <div className="relative p-2 text-center">
          <p className="text-white text-lg font-bold">Le bon plan Goazen! : </p>
          <p className="text-2xl font-bold">{event.name}</p>
          <p className="text-lg font-bold text-center underline">{event.subtitle}</p>
          {isSingleEvent && (
            <p className="text-white text-lg font-bold">
              {formatDate(singleEvent?.date as string)}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

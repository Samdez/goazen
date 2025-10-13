import { SpecialEvent } from '@/payload-types'
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
  return (
    <div className="flex justify-center w-full items-center px-12 md:px-32 mb-4 ">
      <Link
        className="bg-[#E45110] text-white hover:bg-[#E45110]/80 h-32 flex flex-col items-center justify-center rounded-xl md:w-1/2 w-full drop-shadow-xl"
        href={eventUrl}
      >
        <div className="p-2 text-center">
          <p className="text-white text-lg font-bold">Le bon plan Goazen! : </p>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <h2 className="text-lg font-bold text-center underline">{event.subtitle}</h2>
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

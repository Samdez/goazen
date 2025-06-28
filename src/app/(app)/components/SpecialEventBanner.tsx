import { SpecialEvent } from '@/payload-types'
import Link from 'next/link'
import { getPlaceholderImage } from '../queries/get-placeholder-image'
import Image from 'next/image'

export default async function SpecialEventBanner({ event }: { event: SpecialEvent }) {
  return (
    <div className="flex justify-center w-full items-center px-12 md:px-32 mb-4 ">
      <Link
        className="bg-[#E45110] text-white hover:bg-[#E45110]/80 h-32 flex flex-col items-center justify-center rounded-xl md:w-1/2 w-full drop-shadow-xl"
        href={`/concerts/evenement/${event.slug}`}
      >
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <h2 className="text-lg font-bold text-center underline">{event.subtitle}</h2>
      </Link>
    </div>
  )
}

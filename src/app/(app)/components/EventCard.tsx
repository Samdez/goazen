import type { Event } from '@/payload-types'
import { buildEventUrl, cn } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import { bebas, darkerGrotesque } from '../fonts'
import {
  formatDateLong,
  formatEventType,
  formatGenre,
  formatPrice,
  formatTime,
  formatVenue,
} from '@/lib/format-event'
import { PricePill } from './PricePill'
import { TypePill } from './TypePill'

export default function EventCard({
  event,
  placeholderImageUrl,
  className,
}: {
  event: Event
  placeholderImageUrl: string
  className?: string
}) {
  const imageUrl =
    !(typeof event.image === 'string') && event.image
      ? event.image.sizes?.eventCard?.url || event.image?.url
      : placeholderImageUrl

  const eventUrl = buildEventUrl(event)
  const date = formatDateLong(event.date)
  const time = formatTime(event.time)
  const type = formatEventType(event.event_kind)
  const venue = formatVenue(event)
  const genre = formatGenre(event.genres)
  const price = formatPrice({ price: event.price, sold_out: event.sold_out })

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-brand border-brand border-brand-ink bg-brand-paper shadow-brand transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brand-sm',
        className,
      )}
    >
      <Link href={eventUrl} className="flex h-full flex-col">
        <div className="flex flex-col gap-1 px-5 pb-3.5 pt-4">
          <div className="mb-1 flex items-center gap-2.5">
            <span
              className={cn(bebas.className, 'text-sm uppercase tracking-wide text-brand-orange')}
            >
              {date}
            </span>
            {time && (
              <span
                className={cn(bebas.className, 'text-sm uppercase tracking-wide text-brand-ink')}
              >
                {time}
              </span>
            )}
            {type && (
              <span className="ml-auto">
                <TypePill>{type}</TypePill>
              </span>
            )}
          </div>
          <h3
            className={cn(
              bebas.className,
              'mb-1.5 mt-2 text-[22px] uppercase leading-[1.05] tracking-tight text-brand-ink',
            )}
          >
            {event.title}
          </h3>
          {venue && (
            <div
              className={cn(darkerGrotesque.className, 'text-sm font-semibold text-brand-venue')}
            >
              {venue}
            </div>
          )}
          {genre && (
            <div
              className={cn(
                bebas.className,
                'mt-1.5 text-xs uppercase tracking-wide text-brand-ink',
              )}
            >
              {genre}
            </div>
          )}
        </div>
        <div className="relative mt-auto aspect-[16/10] w-full border-t-brand border-brand-ink">
          {imageUrl && (
            <Image
              alt={event.title}
              src={imageUrl}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
              className="object-cover"
              unoptimized
            />
          )}
          <div className="absolute bottom-3 right-3">
            <PricePill withShadow>{price}</PricePill>
          </div>
        </div>
      </Link>
    </article>
  )
}

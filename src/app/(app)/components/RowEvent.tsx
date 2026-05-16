import type { Event } from '@/payload-types'
import { buildEventUrl, cn } from '@/utils'
import Link from 'next/link'
import { bebas, darkerGrotesque } from '../fonts'
import {
  formatDateRow,
  formatEventType,
  formatGenre,
  formatPrice,
  formatTime,
  formatVenue,
} from '@/lib/format-event'
import { TypePill } from './TypePill'

export default function RowEvent({ event }: { event: Event }) {
  const eventUrl = buildEventUrl(event)
  const { day, monthDow } = formatDateRow(event.date)
  const time = formatTime(event.time)
  const type = formatEventType(event.event_kind)
  const venue = formatVenue(event)
  const genre = formatGenre(event.genres, 2)
  const price = formatPrice({ price: event.price, sold_out: event.sold_out })
  const isFree = price === 'Gratuit'

  return (
    <Link
      href={eventUrl}
      className="grid cursor-pointer grid-cols-[80px_1fr_90px] items-center gap-4 border-b-brand border-brand-ink px-6 py-4 transition-colors last:border-b-0 hover:bg-brand-cream-soft md:grid-cols-[110px_80px_1fr_auto_110px] md:gap-6"
    >
      <div className={cn(bebas.className, 'text-[13px] uppercase tracking-wide text-brand-orange')}>
        <span className="mb-1 block text-[26px] leading-[0.9] text-brand-ink">{day}</span>
        {monthDow}
      </div>
      {time && (
        <div className={cn(bebas.className, 'hidden text-sm uppercase tracking-wide md:block')}>
          {time}
        </div>
      )}
      <div className="min-w-0">
        <h4
          className={cn(
            bebas.className,
            'mb-1 truncate text-[20px] uppercase tracking-tight text-brand-ink',
          )}
        >
          {event.title}
        </h4>
        {venue && (
          <div
            className={cn(
              darkerGrotesque.className,
              'truncate text-[13px] font-semibold text-brand-venue',
            )}
          >
            {venue}
          </div>
        )}
      </div>
      <div className="hidden flex-wrap gap-1.5 md:flex">
        {type && <TypePill size="sm">{type}</TypePill>}
        {genre && <TypePill size="sm">{genre}</TypePill>}
      </div>
      <div
        title={price}
        className={cn(
          bebas.className,
          'truncate text-right text-base uppercase tracking-wide',
          isFree && 'text-brand-orange',
        )}
      >
        {price}
      </div>
    </Link>
  )
}

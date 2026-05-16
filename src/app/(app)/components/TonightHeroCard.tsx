import type { Event } from '@/payload-types'
import { buildEventUrl, cn } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import { bebas, darkerGrotesque } from '../fonts'
import {
  formatDateLong,
  formatGenre,
  formatPrice,
  formatTime,
  formatVenue,
} from '@/lib/format-event'
import { getEventKindBadgeClassName, hasEventKind, getEventKindLabel } from '@/utils/event-kind'
import type { HeroLabel } from '../queries/get-hero-event'

const PILL_LABELS: Record<HeroLabel, string> = {
  tonight: 'Ce soir',
  weekend: 'Ce week-end',
  thisWeek: 'Cette semaine',
}

const HEADLINER_LABELS: Record<HeroLabel, string> = {
  tonight: 'Sélection Goazen !',
  weekend: 'Sélection Goazen !',
  thisWeek: 'Sélection Goazen !',
}

export default function TonightHeroCard({
  event,
  placeholderImageUrl,
  labelKey = 'tonight',
}: {
  event: Event
  placeholderImageUrl: string
  labelKey?: HeroLabel
}) {
  const imageUrl =
    !(typeof event.image === 'string') && event.image
      ? event.image.sizes?.hero?.url ||
        event.image.sizes?.eventCard?.url ||
        event.image?.url
      : placeholderImageUrl

  const eventUrl = buildEventUrl(event)
  const date = formatDateLong(event.date)
  const time = formatTime(event.time)
  const venue = formatVenue(event)
  const genre = formatGenre(event.genres)
  const price = formatPrice({ price: event.price, sold_out: event.sold_out })
  const ticketingUrl = event.ticketing_url

  const pillLabel = PILL_LABELS[labelKey]
  const headlinerLabel = HEADLINER_LABELS[labelKey]

  return (
    <article className="relative grid grid-cols-1 overflow-hidden rounded-brand border-brand border-brand-ink bg-brand-paper shadow-brand transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brand-sm md:grid-cols-[1.05fr_1fr]">
      <div className="flex min-h-[280px] flex-col justify-between gap-6 p-8 md:min-h-[380px] md:p-9">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                bebas.className,
                'text-[17px] uppercase tracking-wide text-brand-orange',
              )}
            >
              {date}
            </span>
            {time && (
              <span className={cn(bebas.className, 'text-[17px] uppercase tracking-wide')}>
                {time}
              </span>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {hasEventKind(event) && (
                <span
                  className={cn(
                    bebas.className,
                    'inline-flex items-center rounded-full border-brand px-3 py-[5px] text-[11px] font-bold uppercase tracking-widest',
                    getEventKindBadgeClassName(event.event_kind),
                  )}
                >
                  {getEventKindLabel(event.event_kind)}
                </span>
              )}
              {labelKey === 'tonight' && (
                <span
                  className={cn(
                    bebas.className,
                    'inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-[5px] text-[11px] font-bold uppercase tracking-widest text-brand-paper',
                  )}
                >
                  <span className="inline-block h-[7px] w-[7px] animate-brand-pulse rounded-full bg-brand-paper" />
                  {pillLabel}
                </span>
              )}
              {labelKey !== 'tonight' && (
                <span
                  className={cn(
                    bebas.className,
                    'inline-flex items-center rounded-full bg-brand-orange px-3 py-[5px] text-[11px] font-bold uppercase tracking-widest text-brand-paper',
                  )}
                >
                  {pillLabel}
                </span>
              )}
            </div>
          </div>
          <h3
            className={cn(
              bebas.className,
              'mb-2.5 mt-3.5 text-[clamp(32px,3.2vw,44px)] uppercase leading-none tracking-tight',
            )}
          >
            {event.title}
          </h3>
          {venue && (
            <div
              className={cn(
                darkerGrotesque.className,
                'mb-2.5 text-base font-semibold text-brand-venue',
              )}
            >
              {venue}
            </div>
          )}
          {genre && (
            <div
              className={cn(
                bebas.className,
                'mb-6 text-[13px] uppercase tracking-wide text-brand-ink',
              )}
            >
              {genre}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {ticketingUrl ? (
            <a
              href={ticketingUrl}
              target="_blank"
              rel="noopener"
              className={cn(
                bebas.className,
                'relative z-20 inline-flex items-center gap-2 rounded-[10px] border-brand border-brand-ink bg-brand-orange px-5 py-3.5 text-[15px] uppercase tracking-wide text-brand-paper shadow-brand-sm transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-brand-orange-hover',
              )}
            >
              Réserver
              {price !== 'Prix à confirmer' && price !== 'Complet' && price.length <= 14
                ? ` · ${price}`
                : ''}
            </a>
          ) : (
            <span
              title={price}
              className={cn(
                bebas.className,
                'relative z-20 inline-flex max-w-[260px] items-center gap-2 truncate rounded-[10px] border-brand border-brand-ink bg-brand-orange px-5 py-3.5 text-[15px] uppercase tracking-wide text-brand-paper shadow-brand-sm',
              )}
            >
              {price}
            </span>
          )}
          <Link
            href={eventUrl}
            className={cn(
              bebas.className,
              'relative z-20 inline-flex items-center gap-2 rounded-[10px] border-brand border-brand-ink bg-brand-paper px-4 py-3.5 text-[15px] uppercase tracking-wide shadow-brand-sm transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-brand-cream-soft',
            )}
          >
            Détails
          </Link>
        </div>
      </div>

      <div className="relative min-h-[240px] border-t-brand border-brand-ink md:min-h-[380px] md:border-l-brand md:border-t-0">
        {imageUrl && (
          <Image
            alt={event.title}
            src={imageUrl}
            fill
            sizes="(max-width: 980px) 100vw, 50vw"
            className="object-cover"
            priority
            unoptimized
          />
        )}
        <span
          className={cn(
            bebas.className,
            'absolute right-4 top-4 z-20 rounded-full border-brand border-brand-ink bg-brand-orange px-3 py-1.5 text-[11px] uppercase tracking-widest text-brand-paper',
          )}
        >
          {headlinerLabel}
        </span>
      </div>

      <Link href={eventUrl} aria-label={event.title} className="absolute inset-0 z-10">
        <span className="sr-only">Voir les détails</span>
      </Link>
    </article>
  )
}

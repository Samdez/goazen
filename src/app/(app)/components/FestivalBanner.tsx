import type { SpecialEvent } from '@/payload-types'
import { cn } from '@/utils'
import Link from 'next/link'
import { bebas, darkerGrotesque } from '../fonts'
import { MONTHS_FR } from '@/lib/format-event'

function formatFestivalRange(start?: string | null, end?: string | null): string | null {
  if (!start) return null
  const s = new Date(start)
  const sDay = s.getUTCDate()
  const sMonth = MONTHS_FR[s.getUTCMonth()]
  if (!end) return `${sDay} ${sMonth}`
  const e = new Date(end)
  const eDay = e.getUTCDate()
  const eMonth = MONTHS_FR[e.getUTCMonth()]
  if (s.getUTCMonth() === e.getUTCMonth()) return `${sDay} → ${eDay} ${sMonth}`
  return `${sDay} ${sMonth} → ${eDay} ${eMonth}`
}

export default function FestivalBanner({ event }: { event: SpecialEvent }) {
  const href = event.slug ? `/concerts/evenement/${event.slug}` : '#'
  const range = formatFestivalRange(event.start_date, event.end_date)
  const cityName =
    event['city V2'] && typeof event['city V2'] === 'object' ? event['city V2'].name : null

  return (
    <Link
      href={href}
      className="mt-6 flex flex-col items-start gap-5 rounded-brand border-brand border-brand-ink bg-brand-orange p-6 text-brand-paper shadow-brand transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brand-sm md:flex-row md:items-center md:gap-7 md:p-8"
    >
      <div className="flex-1">
        <div
          className={cn(bebas.className, 'mb-1.5 text-[12px] uppercase tracking-widest opacity-90')}
        >
          ★ Festival{range ? ` · ${range}` : ''}
        </div>
        <h3
          className={cn(bebas.className, 'text-[clamp(26px,2.4vw,36px)] uppercase tracking-tight')}
        >
          {event.name}
        </h3>
        {(event.subtitle || cityName) && (
          <p className={cn(darkerGrotesque.className, 'mt-1 text-[15px] opacity-95')}>
            {event.subtitle}
            {event.subtitle && cityName ? ' · ' : ''}
            {cityName}
          </p>
        )}
      </div>
      <span
        className={cn(
          bebas.className,
          'inline-flex items-center gap-2 rounded-[10px] border-brand border-brand-ink bg-brand-paper px-4 py-3 text-[15px] uppercase tracking-wide text-brand-ink shadow-brand-sm md:ml-auto',
        )}
      >
        Découvrir la prog →
      </span>
    </Link>
  )
}

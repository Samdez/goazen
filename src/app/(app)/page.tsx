import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { z } from 'zod'

import EventCard from './components/EventCard'
import FestivalBanner from './components/FestivalBanner'
import FilterBar from './components/FilterBar'
import RowEvent from './components/RowEvent'
import TonightHeroCard from './components/TonightHeroCard'
import { bebas, darkerGrotesque } from './fonts'
import { cn } from '@/lib/utils'
import { formatDateLong, MONTHS_FR } from '@/lib/format-event'
import { getPlaceholderImage } from './queries/get-placeholder-image'
import {
  getEventsThisWeek,
  getEventsTonight,
  getEventsUpcoming,
  getFeaturedFestival,
} from './queries/event-windows'

const searchParamsSchema = z.object({
  when: z.enum(['tonight', 'weekend', 'week']).optional(),
  free: z.string().optional(),
  region: z.enum(['pays-basque', 'landes']).optional(),
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const { region, free } = searchParamsSchema.parse(sp)
  const freeBool = free === '1' || free === 'true'

  const [tonight, thisWeek, upcoming, featuredFestival, placeholderImage] = await Promise.all([
    getEventsTonight({ region, free: freeBool, limit: 8 }),
    getEventsThisWeek({ region, free: freeBool, limit: 12 }),
    getEventsUpcoming({ region, free: freeBool, limit: 6 }),
    getFeaturedFestival(),
    getPlaceholderImage(),
  ])

  if (!placeholderImage) {
    console.error('No placeholder image found')
    return null
  }

  const todayLabel = formatDateLong(new Date())

  // ---- SEO structured data ----
  const seoEvents = [...tonight, ...thisWeek, ...upcoming].slice(0, 20)
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Goazen!',
    description:
      'Découvrez tous les concerts, DJ sets, festivals et soirées au Pays Basque et dans les Landes',
    url: 'https://goazen.info',
    logo: 'https://goazen.info/GOAZEN_MASCOTTES.png',
    event: seoEvents.map((event) => {
      const loc = event.location && typeof event.location === 'object' ? event.location : null
      const cityData =
        loc?.['city V2'] && typeof loc['city V2'] === 'object' ? loc['city V2'] : null
      return {
        '@type': 'Event',
        name: event.title,
        startDate: event.date,
        endDate: event.date,
        description: event.description,
        image:
          typeof event.image === 'object' && event.image
            ? event.image.url?.startsWith('http')
              ? event.image.url
              : `https://goazen.info${event.image.url}`
            : undefined,
        location: loc
          ? {
              '@type': 'Place',
              name: loc.name,
              address: {
                '@type': 'PostalAddress',
                addressLocality: cityData?.name,
                addressRegion: cityData?.region === 'pays-basque' ? 'Pays Basque' : 'Landes',
                addressCountry: 'FR',
              },
            }
          : undefined,
        offers: event.ticketing_url
          ? {
              '@type': 'Offer',
              url: event.ticketing_url,
              availability: event.sold_out
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            }
          : undefined,
      }
    }),
  }

  return (
    <>
      <Script id="organization-structured-data" type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </Script>

      {/* ============================ HERO ============================ */}
      <section className="mx-auto max-w-[1280px] px-5 pb-7 pt-14 md:px-8">
        <h1
          className={cn(
            bebas.className,
            'text-[clamp(34px,4vw,48px)] leading-[1.05] tracking-tight text-brand-ink',
          )}
        >
          Tous les concerts au <span className="text-brand-orange">Pays Basque</span> et dans les{' '}
          <span className="text-brand-orange">Landes</span>
        </h1>
        <p
          className={cn(
            darkerGrotesque.className,
            'mt-3 max-w-[64ch] text-[17px] text-brand-muted',
          )}
        >
          Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi.
        </p>
      </section>

      <FilterBar />

      <main className="mx-auto max-w-[1280px] px-5 md:px-8">
        {/* ============================= CE SOIR ============================ */}
        <CeSoirSection
          events={tonight}
          todayLabel={todayLabel}
          placeholderImage={placeholderImage}
        />

        {/* ============================= CETTE SEMAINE ============================ */}
        <CetteSemaineSection
          events={thisWeek}
          festival={featuredFestival}
          placeholderImage={placeholderImage}
        />

        {/* ============================= À VENIR ============================ */}
        <AVenirSection events={upcoming} region={region} />
      </main>
    </>
  )
}

// ---------------- Sections ----------------

function CeSoirSection({
  events,
  todayLabel,
  placeholderImage,
}: {
  events: Array<Awaited<ReturnType<typeof getEventsTonight>>[number]>
  todayLabel: string
  placeholderImage: string
}) {
  const cities = uniqueCities(events)
  const sub =
    events.length === 0
      ? 'Rien pour ce soir'
      : `${events.length} event${events.length > 1 ? 's' : ''}${
          cities.length ? ` à ${cities.slice(0, 3).join(', ')}` : ''
        }`

  return (
    <section className="py-10">
      <SectionHead
        title={
          <>
            Ce soir <span className="text-brand-orange">·</span> {todayLabel}
          </>
        }
        meta={sub}
      />
      {events.length === 0 ? (
        <MascotEmpty
          title="Rien de prévu ce soir, une tisane et au lit !"
          subtitle="La prog se met à jour tous les jours — reviens demain."
        />
      ) : (
        <>
          <TonightHeroCard event={events[0]} placeholderImageUrl={placeholderImage} />
          {events.length > 1 && (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(1, 7).map((e) => (
                <EventCard key={e.id} event={e} placeholderImageUrl={placeholderImage} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CetteSemaineSection({
  events,
  festival,
  placeholderImage,
}: {
  events: Array<Awaited<ReturnType<typeof getEventsThisWeek>>[number]>
  festival: Awaited<ReturnType<typeof getFeaturedFestival>>
  placeholderImage: string
}) {
  if (events.length === 0 && !festival) {
    return null
  }
  return (
    <section className="py-10">
      <SectionHead title="Cette semaine" meta={weekMeta(events)} seeAll="/concerts/pays-basque" />
      {events.length > 0 && (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(310px,1fr))]">
          {events.map((e) => (
            <EventCard key={e.id} event={e} placeholderImageUrl={placeholderImage} />
          ))}
        </div>
      )}
      {festival && <FestivalBanner event={festival} />}
    </section>
  )
}

function AVenirSection({
  events,
  region,
}: {
  events: Array<Awaited<ReturnType<typeof getEventsUpcoming>>[number]>
  region?: string
}) {
  if (events.length === 0) return null
  const firstDate = new Date(events[0].date)
  const day = firstDate.getUTCDate()
  const month = MONTHS_FR[firstDate.getUTCMonth()]
  const seeAll = region ? `/concerts/${region}` : '/concerts/pays-basque'
  return (
    <section className="py-10">
      <SectionHead title="À venir" meta={`À partir du ${day} ${month}`} seeAll={seeAll} />
      <div className="overflow-hidden rounded-brand border-brand border-brand-ink bg-brand-paper shadow-brand">
        {events.map((e) => (
          <RowEvent key={e.id} event={e} />
        ))}
      </div>
    </section>
  )
}

// ---------------- Helpers ----------------

function SectionHead({
  title,
  meta,
  seeAll,
}: {
  title: React.ReactNode
  meta?: string
  seeAll?: string
}) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <h2
          className={cn(
            bebas.className,
            'text-[clamp(28px,3vw,38px)] uppercase tracking-tight text-brand-ink',
          )}
        >
          {title}
        </h2>
        {meta && (
          <div
            className={cn(darkerGrotesque.className, 'mt-1 text-sm font-medium text-brand-muted')}
          >
            {meta}
          </div>
        )}
      </div>
      {seeAll && (
        <Link
          href={seeAll}
          className={cn(
            bebas.className,
            'text-sm uppercase tracking-wide text-brand-orange hover:text-brand-orange-hover',
          )}
        >
          Voir tout →
        </Link>
      )}
    </div>
  )
}

function MascotEmpty({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-brand border-brand border-brand-ink bg-brand-paper px-6 py-12 text-center shadow-brand">
      <Image
        src="/GOAZEN_MASCOTTES.png"
        alt=""
        width={160}
        height={160}
        className="h-auto w-32 opacity-90"
        unoptimized
      />
      <div>
        <p className={cn(bebas.className, 'text-[24px] uppercase tracking-tight')}>{title}</p>
        <p className={cn(darkerGrotesque.className, 'mt-1 text-sm text-brand-muted')}>{subtitle}</p>
      </div>
    </div>
  )
}

function uniqueCities(events: Array<{ location?: unknown }>): string[] {
  const out = new Set<string>()
  for (const e of events) {
    const loc =
      e.location && typeof e.location === 'object' ? (e.location as Record<string, unknown>) : null
    const city = loc?.['city V2']
    if (city && typeof city === 'object' && 'name' in city && typeof city.name === 'string') {
      out.add(city.name)
    }
  }
  return Array.from(out)
}

function weekMeta(events: Array<{ date: string }>): string {
  if (!events.length) return ''
  const first = new Date(events[0].date)
  const last = new Date(events[events.length - 1].date)
  const fDay = first.getUTCDate()
  const lDay = last.getUTCDate()
  const fMonth = MONTHS_FR[first.getUTCMonth()]
  const lMonth = MONTHS_FR[last.getUTCMonth()]
  const range =
    first.getUTCMonth() === last.getUTCMonth()
      ? `Du ${fDay} au ${lDay} ${fMonth}`
      : `Du ${fDay} ${fMonth} au ${lDay} ${lMonth}`
  return `${range} · ${events.length} event${events.length > 1 ? 's' : ''}`
}

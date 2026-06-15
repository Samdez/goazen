import Image from 'next/image'
import Link from 'next/link'
import { z } from 'zod'

import EventCard from './components/EventCard'
import FestivalBanner from './components/FestivalBanner'
import FilterBar from './components/FilterBar'
import RowEvent from './components/RowEvent'
import SpecialEventBanner from './components/SpecialEventBanner'
import TonightHeroCard from './components/TonightHeroCard'
import SectionTeaser from './components/SectionTeaser'
import BroadenSuggestions, { type ActiveFilter } from './components/BroadenSuggestions'
import { bebas, darkerGrotesque } from './fonts'
import { cn } from '@/lib/utils'
import { formatDateLong, MONTHS_FR } from '@/lib/format-event'
import { getPlaceholderImage } from './queries/get-placeholder-image'
import { getCategories } from './queries/get-categories'
import {
  getEventsThisWeek,
  getEventsTonight,
  getEventsUpcoming,
  getEventsWeekend,
  getFeaturedFestival,
} from './queries/event-windows'
import {
  tonightBounds,
  thisWeekBounds,
  weekendBounds,
  type WindowOpts,
} from './queries/window-bounds'
import { getBrowseHero, getTonightHero } from './queries/get-hero-event'
import { getShowSpecialEvent } from './queries/get-show-special-event'
import { AUTRE_CATEGORY_NAME, CITY_CHIPS } from './constants'
import { JsonLd } from './components/JsonLd'
import { eventsItemListJsonLd } from '@/lib/structured-data'
import type { Event } from '@/payload-types'

const searchParamsSchema = z.object({
  when: z.enum(['tonight', 'weekend', 'week']).optional(),
  region: z.enum(['pays-basque', 'landes']).optional(),
  city: z.string().optional(),
  genres: z.string().optional(),
})

type SP = z.infer<typeof searchParamsSchema>

export const metadata = {
  alternates: {
    canonical: 'https://goazen.info',
  },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const parsed = searchParamsSchema.parse(sp)
  const { when, region, city: cityRaw } = parsed
  const genres = parsed.genres ? parsed.genres.split(',').filter(Boolean) : []

  // Validate city only when its region matches
  const city = (() => {
    if (!cityRaw || !region) return undefined
    return CITY_CHIPS[region].some((c) => c.slug === cityRaw) ? cityRaw : undefined
  })()

  const filterOpts: WindowOpts = {
    region,
    city,
    genres: genres.length > 0 ? genres : undefined,
  }

  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return null
  }

  const [allCategories, specialEvent] = await Promise.all([
    getCategories(),
    getShowSpecialEvent(),
  ])
  const categories = allCategories.filter((c) => c.name !== AUTRE_CATEGORY_NAME)

  const activeFilters = buildActiveFilters(parsed, genres, categories)

  return (
    <>
      <PageIntro />
      <FilterBar categories={categories} />
      <main className="mx-auto max-w-[1280px] px-5 md:px-8">
        {specialEvent && (
          <div className="pt-6">
            <SpecialEventBanner event={specialEvent} />
          </div>
        )}
        {when ? (
          <FocusedMode
            when={when}
            filterOpts={filterOpts}
            placeholderImage={placeholderImage}
            activeFilters={activeFilters}
          />
        ) : (
          <BrowseMode
            filterOpts={filterOpts}
            placeholderImage={placeholderImage}
            activeFilters={activeFilters}
          />
        )}
      </main>
    </>
  )
}

// ============================== BROWSE MODE ===================================

async function BrowseMode({
  filterOpts,
  placeholderImage,
  activeFilters,
}: {
  filterOpts: WindowOpts
  placeholderImage: string
  activeFilters: ActiveFilter[]
}) {
  const [tonight, thisWeek, upcoming, hero, featuredFestival] = await Promise.all([
    getEventsTonight({ ...filterOpts, limit: 8 }),
    getEventsThisWeek({ ...filterOpts, limit: 12 }),
    getEventsUpcoming({ ...filterOpts, limit: 6 }),
    getBrowseHero(filterOpts),
    getFeaturedFestival(),
  ])

  const seoEvents = [...tonight, ...thisWeek, ...upcoming].slice(0, 20)

  const everythingEmpty = tonight.length === 0 && thisWeek.length === 0 && upcoming.length === 0
  if (everythingEmpty && activeFilters.length > 0) {
    return (
      <>
        <SeoJsonLd events={seoEvents} placeholderImage={placeholderImage} />
        <div className="py-10">
          <BroadenSuggestions active={activeFilters} clearAllHref="/" />
        </div>
      </>
    )
  }

  const todayLabel = formatDateLong(new Date())

  return (
    <>
      <SeoJsonLd events={seoEvents} placeholderImage={placeholderImage} />

      <CeSoirSection
        events={tonight}
        thisWeekCount={thisWeek.length}
        upcomingCount={upcoming.length}
        hero={hero}
        todayLabel={todayLabel}
        placeholderImage={placeholderImage}
      />

      <CetteSemaineSection
        events={thisWeek}
        festival={featuredFestival}
        placeholderImage={placeholderImage}
      />

      <AVenirSection events={upcoming} />
    </>
  )
}

// ============================== FOCUSED MODE ==================================

async function FocusedMode({
  when,
  filterOpts,
  placeholderImage,
  activeFilters,
}: {
  when: 'tonight' | 'weekend' | 'week'
  filterOpts: WindowOpts
  placeholderImage: string
  activeFilters: ActiveFilter[]
}) {
  const limit = 60
  const [events, festival, tonightHero] = await Promise.all([
    when === 'tonight'
      ? getEventsTonight({ ...filterOpts, limit })
      : when === 'weekend'
        ? getEventsWeekend({ ...filterOpts, limit })
        : getEventsThisWeek({ ...filterOpts, limit }),
    getFeaturedFestival(
      when === 'tonight'
        ? tonightBounds()
        : when === 'weekend'
          ? weekendBounds()
          : thisWeekBounds(),
    ),
    when === 'tonight' ? getTonightHero(filterOpts) : Promise.resolve(null),
  ])

  const seoEvents = events.slice(0, 20)

  if (events.length === 0) {
    return (
      <>
        <SeoJsonLd events={seoEvents} placeholderImage={placeholderImage} />
        <div className="py-10">
          <BroadenSuggestions
            active={activeFilters.filter((f) => f.paramKey !== 'when' || activeFilters.length > 1)}
            clearAllHref="/"
          />
        </div>
      </>
    )
  }

  const title = focusedTitle(when)
  const heroEventId = tonightHero?.event.id
  const rest = heroEventId ? events.filter((e) => e.id !== heroEventId) : events

  return (
    <>
      <SeoJsonLd events={seoEvents} placeholderImage={placeholderImage} />
      <section className="py-10">
        <SectionHead
          title={title}
          meta={`${events.length} événement${events.length > 1 ? 's' : ''}`}
        />
        {festival && (
          <div className="mb-6">
            <FestivalBanner event={festival} />
          </div>
        )}
        {tonightHero && (
          <div className="mb-6">
            <TonightHeroCard
              event={tonightHero.event}
              placeholderImageUrl={placeholderImage}
              labelKey={tonightHero.label}
            />
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(310px,1fr))]">
            {rest.map((e) => (
              <EventCard key={e.id} event={e} placeholderImageUrl={placeholderImage} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

// ============================== SECTIONS (BROWSE) =============================

function CeSoirSection({
  events,
  thisWeekCount,
  upcomingCount,
  hero,
  todayLabel,
  placeholderImage,
}: {
  events: Event[]
  thisWeekCount: number
  upcomingCount: number
  hero: Awaited<ReturnType<typeof getBrowseHero>>
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

  const showSeeAll = events.length > 7
  const seeAll = showSeeAll ? { href: '/concerts', label: 'Voir plus →' } : undefined
  const heroEventId = hero?.event.id
  const others = heroEventId ? events.filter((e) => e.id !== heroEventId) : events

  return (
    <section className="py-10">
      <SectionHead
        title={
          <>
            Ce soir <span className="text-brand-orange">·</span> {todayLabel}
          </>
        }
        meta={sub}
        seeAll={seeAll}
      />
      {events.length === 0 && hero ? (
        // Tonight is empty in the filtered set, but the unfiltered hero algorithm
        // surfaced something for a later window — show it as a fallback hero.
        <TonightHeroCard
          event={hero.event}
          placeholderImageUrl={placeholderImage}
          labelKey={hero.label}
        />
      ) : events.length === 0 ? (
        thisWeekCount > 0 ? (
          <SectionTeaser
            title="Rien de prévu ce soir"
            hint="Voir ce qui arrive cette semaine ↓"
            href="#cette-semaine"
          />
        ) : upcomingCount > 0 ? (
          <SectionTeaser
            title="Rien de prévu ce soir"
            hint="Voir les événements à venir ↓"
            href="#a-venir"
          />
        ) : (
          <MascotEmpty
            title="Rien de prévu ce soir, une tisane et au lit !"
            subtitle="La prog se met à jour tous les jours — reviens demain."
          />
        )
      ) : (
        <>
          {hero && (
            <TonightHeroCard
              event={hero.event}
              placeholderImageUrl={placeholderImage}
              labelKey={hero.label}
            />
          )}
          {others.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 6).map((e) => (
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
  events: Event[]
  festival: Awaited<ReturnType<typeof getFeaturedFestival>>
  placeholderImage: string
}) {
  if (events.length === 0 && !festival) {
    return null
  }
  return (
    <section id="cette-semaine" className="py-10">
      <SectionHead
        title="Cette semaine"
        meta={weekMeta(events)}
        seeAll={{ href: '/concerts', label: 'Voir plus →' }}
      />
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

function AVenirSection({ events }: { events: Event[] }) {
  if (events.length === 0) return null
  const firstDate = new Date(events[0].date)
  const day = firstDate.getUTCDate()
  const month = MONTHS_FR[firstDate.getUTCMonth()]
  const seeAll = {
    href: '/concerts',
    label: 'Voir plus →',
  }
  return (
    <section id="a-venir" className="py-10">
      <SectionHead title="À venir" meta={`À partir du ${day} ${month}`} seeAll={seeAll} />
      <div className="overflow-hidden rounded-brand border-brand border-brand-ink bg-brand-paper shadow-brand">
        {events.map((e) => (
          <RowEvent key={e.id} event={e} />
        ))}
      </div>
    </section>
  )
}

// ============================== SHARED CHROME ================================

function PageIntro() {
  return (
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
        className={cn(darkerGrotesque.className, 'mt-3 max-w-[64ch] text-[17px] text-brand-muted')}
      >
        Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi.
      </p>
    </section>
  )
}

function SectionHead({
  title,
  meta,
  seeAll,
}: {
  title: React.ReactNode
  meta?: string
  seeAll?: { href: string; label: string }
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
          href={seeAll.href}
          className={cn(
            bebas.className,
            'text-sm uppercase tracking-wide text-brand-orange hover:text-brand-orange-hover',
          )}
        >
          {seeAll.label}
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

function SeoJsonLd({ events, placeholderImage }: { events: Event[]; placeholderImage: string }) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Goazen!',
    description:
      'Découvrez tous les concerts, DJ sets, festivals et soirées au Pays Basque et dans les Landes',
    url: 'https://goazen.info',
    logo: 'https://goazen.info/GOAZEN_MASCOTTES.png',
  }
  return (
    <>
      <JsonLd id="organization-structured-data" data={organization} />
      <JsonLd id="home-events" data={eventsItemListJsonLd(events, { placeholderImage })} />
    </>
  )
}

// ============================== HELPERS =======================================

function focusedTitle(when: 'tonight' | 'weekend' | 'week'): React.ReactNode {
  if (when === 'tonight') return <>Ce soir</>
  if (when === 'weekend') return <>Ce week-end</>
  return <>Cette semaine</>
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

function buildActiveFilters(
  sp: SP,
  genres: string[],
  categories: Array<{ slug?: string | null; name: string }>,
): ActiveFilter[] {
  const params = new URLSearchParams()
  if (sp.when) params.set('when', sp.when)
  if (sp.region) params.set('region', sp.region)
  if (sp.city) params.set('city', sp.city)
  if (genres.length) params.set('genres', genres.join(','))

  const withoutParam = (key: string, value?: string): string => {
    const next = new URLSearchParams(params.toString())
    if (key === 'genres' && value) {
      const kept = genres.filter((g) => g !== value)
      if (kept.length) next.set('genres', kept.join(','))
      else next.delete('genres')
    } else if (key === 'region') {
      next.delete('region')
      next.delete('city')
    } else {
      next.delete(key)
    }
    const qs = next.toString()
    return qs ? `/?${qs}` : '/'
  }

  const out: ActiveFilter[] = []

  for (const g of genres) {
    const cat = categories.find((c) => c.slug === g)
    if (!cat) continue
    out.push({ paramKey: 'genres', label: cat.name, href: withoutParam('genres', g) })
  }

  if (sp.city) {
    const region = sp.region
    const cityLabel = region
      ? (CITY_CHIPS[region].find((c) => c.slug === sp.city)?.label ?? sp.city)
      : sp.city
    out.push({ paramKey: 'city', label: cityLabel, href: withoutParam('city') })
  }

  if (sp.region) {
    const regionLabel = sp.region === 'pays-basque' ? 'Pays Basque' : 'Landes'
    out.push({ paramKey: 'region', label: regionLabel, href: withoutParam('region') })
  }

  if (sp.when) {
    const whenLabel =
      sp.when === 'tonight' ? 'Ce soir' : sp.when === 'weekend' ? 'Ce week-end' : 'Cette semaine'
    out.push({ paramKey: 'when', label: whenLabel, href: withoutParam('when') })
  }

  return out
}

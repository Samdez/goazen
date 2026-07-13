import { getSpecialEvent } from '@/app/(app)/queries/get-special-event'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import Link from 'next/link'
import Script from 'next/script'
import EventsGrid from '@/app/(app)/components/EventsGrid'
import { notFound } from 'next/navigation'
import { bebas } from '@/app/(app)/fonts'
import SelectionSwitch from '@/app/(app)/components/SelectionSwitch'
import { getSpecialEvents } from '@/app/(app)/queries/get-special-events'
import { RichTextWrapper } from '@/app/(app)/components/RichTextWrapper'
import { buildEventUrl, cn, lexicalToPlainText } from '@/utils'
import type { Event, SpecialEvent } from '@/payload-types'

export async function generateStaticParams() {
  const specialEvents = await getSpecialEvents()

  return specialEvents.docs.map((specialEvent) => ({
    slug: specialEvent.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const specialEventData = await getSpecialEvent(slug)

  if (!specialEventData.docs.length) {
    return {}
  }

  const specialEvent = specialEventData.docs[0]

  const description = (
    specialEvent.meta_description?.trim() ||
    lexicalToPlainText(specialEvent.description) ||
    `Découvrez l'événement spécial ${specialEvent.name} et tous les concerts associés.`
  ).slice(0, 200)

  const imageUrl =
    specialEvent.image && typeof specialEvent.image === 'object' && specialEvent.image.url
      ? specialEvent.image.url.startsWith('http')
        ? specialEvent.image.url
        : `https://goazen.info${specialEvent.image.url}`
      : undefined

  return {
    title: `${specialEvent.name} | Événement Spécial - Goazen!`,
    description,
    alternates: {
      canonical: `https://goazen.info/concerts/evenement/${slug}`,
    },
    openGraph: {
      title: `${specialEvent.name} | Événement Spécial - Goazen!`,
      description,
      url: `https://goazen.info/concerts/evenement/${slug}`,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${specialEvent.name} | Événement Spécial`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function SpecialEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ selectionOnly: string }>
}) {
  const { slug } = await params
  const { selectionOnly } = await searchParams
  const showSelectionOnly = selectionOnly === 'true'
  const now = new Date().toISOString()
  let gridStartDate = now
  let gridEndDate: string | undefined

  const [specialEventData, placeholderImage, upcomingEvents] = await Promise.all([
    getSpecialEvent(slug),
    getPlaceholderImage(),
    getCachedEvents({
      specialEvent: slug,
      startDate: now,
      selectionOnly: showSelectionOnly,
    }),
  ])

  if (!specialEventData.docs.length) {
    notFound()
  }

  // Fallback: no upcoming events (edition over, next one not announced yet) →
  // show the latest past edition instead of an empty page, on the same URL.
  let events = upcomingEvents
  let pastEditionYear: number | null = null
  if (!events.docs.length) {
    const latest = await getCachedEvents({
      specialEvent: slug,
      startDate: '2000-01-01',
      endDate: now,
      sort: '-date',
      limit: 1,
      selectionOnly: showSelectionOnly,
    })
    const lastDate = latest.docs[0]?.date
    if (lastDate) {
      const windowStart = new Date(lastDate)
      windowStart.setDate(windowStart.getDate() - 30)
      gridStartDate = windowStart.toISOString()
      gridEndDate = lastDate
      events = await getCachedEvents({
        specialEvent: slug,
        startDate: gridStartDate,
        endDate: gridEndDate,
        selectionOnly: showSelectionOnly,
      })
      if (events.docs.length) {
        pastEditionYear = new Date(lastDate).getFullYear()
      }
    }
  }

  const specialEvent = specialEventData.docs[0]

  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

  const jsonLd = buildSpecialEventJsonLd(specialEvent, events.docs, slug)
  const cityLinks = uniqueEventCities(events.docs)

  return (
    <>
      <Script id="special-event-structured-data" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <div className="px-12 md:px-32">
        <header className="pt-10 pb-4 text-center">
          <h1
            className={cn(
              bebas.className,
              'text-[clamp(34px,5vw,56px)] uppercase leading-[1.05] tracking-tight text-brand-ink',
            )}
          >
            {specialEvent.name}
          </h1>
          {specialEvent.subtitle && (
            <p className="mt-2 text-lg font-medium text-brand-muted">{specialEvent.subtitle}</p>
          )}
        </header>
        <div className="flex items-center justify-center gap-2 py-8">
          <SelectionSwitch
            selectionOnly={showSelectionOnly}
            // onSelectionOnlyChange={}
            slug={slug}
          />
        </div>
        {pastEditionYear && (
          <div className="pb-8 text-center">
            <p className="inline-block rounded-full border-2 border-brand-ink px-5 py-2 text-sm font-bold text-brand-ink">
              L&apos;édition {pastEditionYear} est terminée — revivez les concerts en attendant la
              prochaine édition !
            </p>
          </div>
        )}
      </div>
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <EventsGrid
          initialEvents={events.docs}
          initialNextPage={events.nextPage}
          hasNextPageProps={events.hasNextPage}
          startDate={gridStartDate}
          endDate={gridEndDate}
          placeholderImageUrl={placeholderImage}
          specialEvent={slug}
          selectionOnly={showSelectionOnly}
        />
      </Suspense>
      {/* Internal links to the city pages that actually have tagged concerts —
          descriptive anchors, derived from the events (not hardcoded). */}
      {cityLinks.length > 0 && (
        <nav aria-label="Concerts par ville" className="px-12 pt-10 md:px-32">
          <h2
            className={cn(bebas.className, 'mb-4 text-2xl uppercase tracking-tight text-brand-ink')}
          >
            Concerts par ville
          </h2>
          <ul className="flex flex-wrap gap-3">
            {cityLinks.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/concerts/${c.region}/${c.slug}`}
                  className="inline-block rounded-full border-2 border-brand-ink px-4 py-1.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper"
                >
                  Concerts à {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {/* SEO body below the events: users see the concerts first, crawlers
          still get the full description + H2s in the DOM. */}
      {specialEvent.description && (
        <section className="px-12 py-12 md:px-32">
          <RichTextWrapper data={specialEvent.description} />
        </section>
      )}
    </>
  )
}

// Unique cities (region + slug + name) that have a tagged concert, in first-seen
// order. Source of the "Concerts par ville" internal links.
function uniqueEventCities(events: Event[]): Array<{ region: string; slug: string; name: string }> {
  const map = new Map<string, { region: string; slug: string; name: string }>()
  for (const e of events) {
    const loc = e.location && typeof e.location === 'object' ? e.location : null
    const city = loc?.['city V2']
    if (city && typeof city === 'object' && city.slug && city.region && city.name) {
      map.set(city.slug, { region: city.region, slug: city.slug, name: city.name })
    }
  }
  return Array.from(map.values())
}

function buildSpecialEventJsonLd(specialEvent: SpecialEvent, events: Event[], slug: string) {
  const url = `https://goazen.info/concerts/evenement/${slug}`
  const description =
    specialEvent.meta_description?.trim() ||
    lexicalToPlainText(specialEvent.description) ||
    undefined
  const image =
    specialEvent.image && typeof specialEvent.image === 'object' && specialEvent.image.url
      ? specialEvent.image.url.startsWith('http')
        ? specialEvent.image.url
        : `https://goazen.info${specialEvent.image.url}`
      : undefined
  const cityName =
    specialEvent['city V2'] && typeof specialEvent['city V2'] === 'object'
      ? specialEvent['city V2'].name
      : undefined

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://goazen.info' },
        { '@type': 'ListItem', position: 2, name: specialEvent.name, item: url },
      ],
    },
  ]

  // Only emit an Event node when we have a start date (schema.org requires it).
  if (specialEvent.start_date) {
    graph.push({
      '@type': 'Event',
      name: specialEvent.name,
      url,
      startDate: specialEvent.start_date,
      ...(specialEvent.end_date ? { endDate: specialEvent.end_date } : {}),
      ...(description ? { description } : {}),
      ...(image ? { image } : {}),
      ...(cityName
        ? {
            location: {
              '@type': 'Place',
              name: cityName,
              address: {
                '@type': 'PostalAddress',
                addressLocality: cityName,
                addressCountry: 'FR',
              },
            },
          }
        : {}),
      ...(events.length
        ? {
            subEvent: events.slice(0, 50).map((e) => ({
              '@type': 'Event',
              name: e.title,
              startDate: e.date,
              url: `https://goazen.info${buildEventUrl(e)}`,
            })),
          }
        : {}),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

import { getCachedEvents } from './queries/get-events'
import { z } from 'zod'
import EventsGrid from './components/EventsGrid'
import { getPlaceholderImage } from './queries/get-placeholder-image'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import { getCategories } from './queries/get-categories'
import UnifiedFilterSections from './components/UnifiedFilterSection'
import { GenreFilterComboBox } from './components/GenreFilterComboBox'
import { DateFilterComboBox } from './components/DateFilterComboBox'
import { getShowSpecialEvent } from './queries/get-show-special-event'
import SpecialEventBanner from './components/SpecialEventBanner'
import Script from 'next/script'

const searchParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  activeTime: z.enum(['day', 'week']).optional(),
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const currSearchParams = await searchParams
  const { activeTime, startDate, endDate } = searchParamsSchema.parse(currSearchParams)
  const showSpecialEvent = await getShowSpecialEvent()

  let date: string
  if (!startDate) {
    date = new Date(new Date().setDate(new Date().getDate())).toISOString()
  } else {
    date = startDate
  }
  const [categories, initialEvents, placeholderImage] = await Promise.all([
    getCategories(),
    getCachedEvents({ startDate: date }),
    getPlaceholderImage(),
  ])
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

  // Create structured data for the organization and upcoming events
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Goazen!',
    description:
      'Découvrez tous les concerts, DJ sets, festivals et soirées au Pays Basque et dans les Landes',
    url: 'https://goazen.info',
    logo: 'https://goazen.info/GOAZEN_MASCOTTES.png',
    event: initialEvents.docs.map((event) => {
      const eventLocation =
        event.location && typeof event.location === 'object' ? event.location : null
      const cityData =
        eventLocation?.['city V2'] && typeof eventLocation['city V2'] === 'object'
          ? eventLocation['city V2']
          : null

      return {
        '@type': 'Event',
        name: event.title,
        startDate: event.date,
        endDate: event.date,
        description: event.description,
        image: typeof event.image === 'object' ? event.image?.url : undefined,
        location: eventLocation
          ? {
              '@type': 'Place',
              name: eventLocation.name,
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

      {showSpecialEvent.showSpecialEvent && (
        <SpecialEventBanner event={showSpecialEvent.specialEvent} />
      )}
      <UnifiedFilterSections
        activeTime={activeTime}
        titleWithEffect
        buttons={[
          <GenreFilterComboBox key="genre-filter" categories={categories} />,
          <DateFilterComboBox key="date-filter" days={['day', 'week']} />,
        ]}
        subTitle="Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi"
      />
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
        key={`${activeTime}_${startDate}_${endDate}`}
      >
        <EventsGrid
          initialEvents={initialEvents.docs}
          initialNextPage={initialEvents.nextPage}
          hasNextPageProps={initialEvents.hasNextPage}
          startDate={date}
          endDate={endDate}
          placeholderImageUrl={placeholderImage}
        />
      </Suspense>
    </>
  )
}

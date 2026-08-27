import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import { getCachedEvents } from '../queries/get-events'
import { getPlaceholderImage } from '../queries/get-placeholder-image'
import { getCities } from '../queries/get-cities'
import UnifiedFilterSections from '../components/UnifiedFilterSection'
import { CityFilterCombobox } from '../components/CityFilterCombobox'
import EventsGrid from '../components/EventsGrid'
import { JsonLd } from '../components/JsonLd'
import { breadcrumbJsonLd, eventsItemListJsonLd } from '@/lib/structured-data'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Concerts & soirées au Pays Basque — agenda | Goazen!'
  const description =
    'Agenda complet des concerts, DJ sets, festivals et soirées à venir au Pays Basque et dans les Landes. Toute la programmation sur Goazen!'
  const canonical = 'https://goazen.info/concerts'

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
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

export default async function ConcertsPage() {
  const startDate = new Date().toISOString()
  const [cities, placeholderImage, events] = await Promise.all([
    getCities(),
    getPlaceholderImage(),
    getCachedEvents({ startDate }),
  ])

  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
          <PacmanLoader />
        </div>
      }
    >
      <JsonLd
        id="concerts-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Concerts', path: '/concerts' },
        ])}
      />
      <JsonLd id="concerts-events" data={eventsItemListJsonLd(events.docs, { placeholderImage })} />
      <UnifiedFilterSections
        title="Tous les concerts, soirées et DJ sets au Pays Basque et dans les Landes"
        subTitle="Tous les concerts et soirées à venir:"
        buttons={[
          <CityFilterCombobox
            key="city-filter"
            cities={[
              ...cities.docs,
              { id: 'all', name: 'Toutes les villes', createdAt: '', updatedAt: '' },
            ]}
          />,
        ]}
      />
      <EventsGrid
        initialEvents={events.docs}
        initialNextPage={events.nextPage}
        hasNextPageProps={events.hasNextPage}
        startDate={startDate}
        placeholderImageUrl={placeholderImage}
      />
    </Suspense>
  )
}

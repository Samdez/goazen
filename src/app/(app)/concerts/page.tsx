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

export async function generateMetadata() {
  return {
    title: 'Tous les concerts et soirées au Pays Basque et dans les Landes | Goazen!',
    description:
      'Agenda complet de tous les concerts, DJ sets, festivals et soirées à venir au Pays Basque et dans les Landes.',
    alternates: {
      canonical: 'https://goazen.info/concerts',
    },
    openGraph: {
      title: 'Tous les concerts et soirées au Pays Basque et dans les Landes | Goazen!',
      description:
        'Agenda complet de tous les concerts, DJ sets, festivals et soirées à venir au Pays Basque et dans les Landes.',
      url: 'https://goazen.info/concerts',
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tous les concerts au Pays Basque et dans les Landes | Agenda Complet',
      description:
        'Agenda complet de tous les concerts, DJ sets, festivals et soirées à venir au Pays Basque et dans les Landes.',
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

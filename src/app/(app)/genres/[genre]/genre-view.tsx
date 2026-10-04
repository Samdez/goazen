import { DateFilterComboBox } from '../../components/DateFilterComboBox'
import EventsGrid from '../../components/EventsGrid'
import { GenreFilterComboBox } from '../../components/GenreFilterComboBox'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'
import { getCategories } from '../../queries/get-categories'
import { getCachedEvents } from '../../queries/get-events'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import { OG_IMAGE } from '@/lib/structured-data'

function humanizeSlug(slug: string) {
  return slug.replace(/-/g, ' ')
}

async function getGenreName(slug: string) {
  const categories = await getCategories()
  const match = categories.find((c) => c.slug === slug)
  return match?.name ?? humanizeSlug(slug)
}

export async function buildGenreMetadata(genre: string): Promise<Metadata> {
  const name = await getGenreName(genre)
  const title = `Concerts ${name} — agenda | Goazen!`
  const description =
    `Agenda des concerts ${name} à venir au Pays Basque et dans les Landes. Tous les événements ${name} près de chez toi, mis à jour chaque jour.`.slice(
      0,
      155,
    )
  const canonical = `https://goazen.info/genres/${genre}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Goazen!',
      images: [OG_IMAGE],
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

export type GenreFilters = {
  startDate?: string
  endDate?: string
  activeTime?: 'day' | 'week'
}

export async function GenreView({
  genre,
  filters: { activeTime, startDate = new Date().toISOString(), endDate },
}: {
  genre: string
  filters: GenreFilters
}) {
  const categories = await getCategories()
  const name = categories.find((c) => c.slug === genre)?.name ?? humanizeSlug(genre)
  const placeholderImageUrl = await getPlaceholderImage()
  const initialEvents = await getCachedEvents({
    category: genre,
    startDate,
    endDate,
  })

  return (
    <>
      <UnifiedFilterSections
        title={`Concerts ${name} au Pays Basque et dans les Landes`}
        buttons={[
          <GenreFilterComboBox key="genre-filter" categories={categories} />,
          <DateFilterComboBox key="date-filter" days={['day', 'week']} />,
        ]}
        subTitle="Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi"
      />
      {/* EventsGrid lit useSearchParams : sur la page statique, Next exige une
          frontière Suspense (la grille est alors rendue côté client). */}
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <EventsGrid
          initialEvents={initialEvents.docs}
          initialNextPage={initialEvents.nextPage}
          hasNextPageProps={initialEvents.hasNextPage}
          startDate={startDate}
          endDate={endDate}
          activeTime={activeTime}
          placeholderImageUrl={placeholderImageUrl || ''}
        />
      </Suspense>
    </>
  )
}

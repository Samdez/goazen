import { DateFilterComboBox } from '../../components/DateFilterComboBox'
import EventsGrid from '../../components/EventsGrid'
import { GenreFilterComboBox } from '../../components/GenreFilterComboBox'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'
import { getCategories } from '../../queries/get-categories'
import { getCachedEvents } from '../../queries/get-events'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { searchParamsSchema } from '../../schemas/searchParams'

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === genre)
  const genreLabel = category?.name || genre

  return {
    title: `Concerts ${genreLabel} au Pays Basque et dans les Landes | Goazen!`,
    description: `Agenda des concerts ${genreLabel} au Pays Basque et dans les Landes. Découvrez tous les événements musicaux à venir.`,
    alternates: {
      canonical: `https://goazen.info/genres/${genre}`,
    },
    openGraph: {
      title: `Concerts ${genreLabel} au Pays Basque et dans les Landes | Goazen!`,
      description: `Agenda des concerts ${genreLabel} au Pays Basque et dans les Landes.`,
      url: `https://goazen.info/genres/${genre}`,
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

async function Genre({
  params,
  searchParams,
}: {
  params: Promise<{ genre: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { genre } = await params
  const {
    activeTime,
    startDate = new Date().toISOString(),
    endDate,
  } = searchParamsSchema.parse(await searchParams)

  const categories = await getCategories()
  const placeholderImageUrl = await getPlaceholderImage()
  const initialEvents = await getCachedEvents({
    category: genre,
    startDate,
    endDate,
  })

  const category = categories.find((c) => c.slug === genre)
  const genreLabel = category?.name || genre

  return (
    <>
      <UnifiedFilterSections
        activeTime={activeTime}
        title={`Concerts ${genreLabel} au Pays Basque et dans les Landes`}
        buttons={[
          <GenreFilterComboBox key="genre-filter" categories={categories} />,
          <DateFilterComboBox key="date-filter" days={['day', 'week']} />,
        ]}
        subTitle="Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi"
        categoryParam={genre}
      />
      <EventsGrid
        initialEvents={initialEvents.docs}
        initialNextPage={initialEvents.nextPage}
        hasNextPageProps={initialEvents.hasNextPage}
        startDate={startDate}
        endDate={endDate}
        activeTime={activeTime}
        placeholderImageUrl={placeholderImageUrl || ''}
      />
      ;
    </>
  )
}

export default Genre

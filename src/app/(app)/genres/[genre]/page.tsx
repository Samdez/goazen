import { DateFilterComboBox } from '../../components/DateFilterComboBox'
import EventsGrid from '../../components/EventsGrid'
import { GenreFilterComboBox } from '../../components/GenreFilterComboBox'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'
import { getCategories } from '../../queries/get-categories'
import { getCachedEvents } from '../../queries/get-events'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { searchParamsSchema } from '../../schemas/searchParams'
import { AUTRE_CATEGORY_NAME } from '../../constants'

function humanizeSlug(slug: string) {
  return slug.replace(/-/g, ' ')
}

async function getGenreName(slug: string) {
  const categories = await getCategories()
  const match = categories.find((c) => c.slug === slug)
  return match?.name ?? humanizeSlug(slug)
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories
    .filter((c) => c.slug && c.name !== AUTRE_CATEGORY_NAME)
    .map((c) => ({ genre: c.slug as string }))
}

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params
  const name = await getGenreName(genre)
  const title = `Concerts ${name} au Pays Basque et dans les Landes | Goazen!`
  const description = `Agenda des concerts ${name} au Pays Basque et dans les Landes. Tous les événements ${name} à venir près de chez toi.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://goazen.info/genres/${genre}`,
    },
    openGraph: {
      title,
      description,
      url: `https://goazen.info/genres/${genre}`,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Concerts ${name} au Pays Basque et dans les Landes`,
      description,
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
      <EventsGrid
        initialEvents={initialEvents.docs}
        initialNextPage={initialEvents.nextPage}
        hasNextPageProps={initialEvents.hasNextPage}
        startDate={startDate}
        endDate={endDate}
        activeTime={activeTime}
        placeholderImageUrl={placeholderImageUrl || ''}
      />
    </>
  )
}

export default Genre

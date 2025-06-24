import { DateFilterComboBox } from '../../components/DateFilterComboBox'
import EventsGrid from '../../components/EventsGrid'
import { GenreFilterComboBox } from '../../components/GenreFilterComboBox'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'
import { getCategories } from '../../queries/get-categories'
import { getCachedEvents } from '../../queries/get-events'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { searchParamsSchema } from '../../schemas/searchParams'

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

  return (
    <>
      <UnifiedFilterSections
        activeTime={activeTime}
        titleWithEffect
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

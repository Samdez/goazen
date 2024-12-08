import EventsGrid from '../../components/EventsGrid'
import FilterSection from '../../components/FilterSection'
import { getCategories } from '../../queries/get-categories'
import { getEvents } from '../../queries/get-events'
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
  const initialEvents = await getEvents({
    category: genre,
    startDate,
    endDate,
  })

  return (
    <>
      <FilterSection categories={categories} activeTime={activeTime} />
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

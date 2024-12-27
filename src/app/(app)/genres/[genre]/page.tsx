import EventsGrid from '../../components/EventsGrid'
import FilterSection from '../../components/FilterSection'
import { searchParamsSchema } from '../../schemas/searchParams'
import { getCategories } from '../../api/queries/payload/get-categories'
import { getCachedEvents } from '../../api/queries/payload/get-events'
import { getPlaceholderImage } from '../../api/queries/payload/get-placeholder-image'

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

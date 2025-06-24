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

import { z } from 'zod'
import EventsGrid from './components/EventsGrid'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import FilterSection from './components/FilterSection'
import { getCategories } from './api/queries/payload/get-categories'
import { getEvents } from './api/queries/payload/get-events'
import { getPlaceholderImage } from './api/queries/payload/get-placeholder-image'

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
  const {
    activeTime,
    startDate = new Date().toISOString(),
    endDate,
  } = searchParamsSchema.parse(currSearchParams)

  const categories = await getCategories()
  const initialEvents = await getEvents({ startDate })
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  return (
    <>
      <FilterSection activeTime={activeTime} categories={categories} />
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
          startDate={startDate}
          endDate={endDate}
          placeholderImageUrl={placeholderImage}
        />
      </Suspense>
    </>
  )
}

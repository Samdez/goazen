import { getEvents } from './queries/get-events'
import { z } from 'zod'
import EventsGrid from './components/EventsGrid'
import { getPlaceholderImage } from './queries/get-placeholder-image'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'

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

  const initialEvents = await getEvents({ startDate })
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  return (
    <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
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
          placeholderImageUrl={placeholderImage}
        />
      </Suspense>
    </div>
  )
}

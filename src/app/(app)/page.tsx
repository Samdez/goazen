import { getEvents } from './queries/get-events'
import { z } from 'zod'
import EventsGrid from './components/EventsGrid'
import { getPlaceholderImage } from './queries/get-placeholder-image'

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

  const initialEvents = await getEvents({ startDate, limit: 12 })
  console.dir(initialEvents.docs, { depth: 5 })
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  return (
    <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
      <EventsGrid
        initialEvents={initialEvents.docs}
        initialNextPage={initialEvents.nextPage}
        startDate={startDate}
        placeholderImageUrl={placeholderImage}
      />
    </div>
  )
}

import { getPayload } from 'payload'
import config from '@payload-config'
import { getEvents } from './queries/get-events'
import { z } from 'zod'
import EventsGrid from './components/EventsGrid'

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

  const payload = await getPayload({ config })
  const initialEvents = await getEvents({ startDate })
  const placeholderImage = await payload.findGlobal({
    slug: 'image-placeholder',
  })
  if (
    !placeholderImage.ImagePlaceholder ||
    typeof placeholderImage.ImagePlaceholder === 'string' ||
    !placeholderImage.ImagePlaceholder.url
  ) {
    console.error('No placeholder image found')
    return
  }
  const placeholderImageUrl = placeholderImage.ImagePlaceholder.url
  return (
    <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
      <EventsGrid
        initialEvents={initialEvents.docs}
        placeholderImageUrl={placeholderImageUrl}
        initialNextPage={initialEvents.nextPage}
        startDate={startDate}
      />
    </div>
  )
}

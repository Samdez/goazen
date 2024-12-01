import { Suspense } from 'react'
import EventsGrid from '../../components/EventsGrid'
import { getEvents } from '../../queries/get-events'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { Event } from '@/payload-types'
import { PaginatedDocs } from 'payload'

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = (await params).city
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  const locations = await getLocations(city)

  let events: Event[] = []
  for (const location of locations.docs) {
    const locationEvents = await getEvents({
      locationId: location.id,
      startDate: new Date().toISOString(),
    })
    events = [...events, ...locationEvents.docs]
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
          <PacmanLoader />
        </div>
      }
    >
      <EventsGrid
        initialEvents={events}
        hasNextPageProps={false}
        startDate={new Date().toISOString()}
        placeholderImageUrl={placeholderImage}
      />
    </Suspense>
  )
}

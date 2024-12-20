import { Suspense } from 'react'
import { getCachedEvents } from '../../queries/get-events'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { Event } from '@/payload-types'
import EventThumbnail from '../../components/EventThumbnail'
import { payload } from '../../client/payload-client'

export async function generateMetadata({ params }: { params: Promise<{ city: string[] }> }) {
  const cityParam = (await params).city
  return {
    title: `Goazen! - Agenda Concerts ${cityParam}`,
    description: `Concerts et DJ sets à ${cityParam} : agenda et programmation complète. Tous les événements musicaux près de chez vous - rock, métal, jazz, rap, électro, reggae. Trouvez les meilleurs concerts au Pays Basque et dans les Landes. Découvrez les prochains concerts à ${cityParam} et dans les salles emblématiques de la région.`,
    robots: {
      index: true,
      googleBot: {
        index: true,
      },
    },
  }
}
export async function generateStaticParams() {
  const events = await payload.find({
    collection: 'cities',
    limit: 100,
  })

  return events.docs.map((city) => ({
    city: city.slug,
  }))
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = (await params).city
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  const locations = await getLocations({ cityName: city, limit: 100 })

  let events: Event[] = []
  for (const location of locations.docs) {
    const locationEvents = await getCachedEvents({
      locationId: location.id,
      startDate: new Date().toISOString(),
    })
    events = [...events, ...locationEvents.docs].sort((a, b) => a.date.localeCompare(b.date))
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
          <PacmanLoader />
        </div>
      }
    >
      <div className="flex flex-wrap justify-around gap-24 px-12 pb-32">
        {events.map((event) => (
          <EventThumbnail event={event} key={event.id} placeholderImageUrl={placeholderImage} />
        ))}
      </div>
    </Suspense>
  )
}

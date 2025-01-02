import { Suspense } from 'react'
import { getCachedEvents } from '../../queries/get-events'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { Event } from '@/payload-types'
import EventThumbnail from '../../components/EventThumbnail'
import { payload } from '../../client/payload-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ city: string[] }> }) {
  const cityParam = (await params).city
  const cityName = Array.isArray(cityParam) ? cityParam[0] : cityParam
  const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1)
  return {
    title: `Concerts et Soirées à ${formattedCityName} | Où Sortir ce Soir - Goazen!`,
    description: `Agenda complet des concerts et soirées à ${formattedCityName}. Découvrez tous les événements musicaux : rock, électro, DJ sets. Programmation des salles de concert à ${formattedCityName}. Guide des meilleures sorties au Pays Basque ce soir et ce weekend.`,
    alternates: {
      canonical: `https://goazen.info/concerts/${cityName}`,
    },
    openGraph: {
      title: `Concerts et Soirées à ${formattedCityName} | Agenda Complet - Goazen!`,
      description: `Agenda des concerts et soirées à ${formattedCityName}. Découvrez tous les événements musicaux et trouvez votre prochaine sortie au Pays Basque ce soir !`,
      url: `https://goazen.info/concerts/${cityName}`,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Concerts à ${formattedCityName} | Agenda Complet`,
      description: `Agenda des concerts et soirées à ${formattedCityName}. Trouvez votre prochaine sortie au Pays Basque !`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
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
    <>
      <div className="flex justify-center mb-4">
        <Link href={'/formulaire'}>
          <Button className="bg-[#ee2244bc] text-white h-16 w-64 text-3xl">
            Partage-nous ton event!
          </Button>
        </Link>
      </div>
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
    </>
  )
}

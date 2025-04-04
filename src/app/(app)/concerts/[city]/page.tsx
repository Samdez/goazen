import { JSX, Suspense } from 'react'
import { getCachedEvents } from '../../queries/get-events'
import { getLocations } from '../../queries/get-locations'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { Event } from '@/payload-types'
import EventThumbnail from '../../components/EventThumbnail'
import { payload } from '../../client/payload-client'
import { cn } from '@/lib/utils'
import { darkerGrotesque } from '../../fonts'
import { getCity } from '../../queries/get-city'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ city: string[] }> }) {
  const cityParam = (await params).city
  const cityName = Array.isArray(cityParam) ? cityParam[0] : cityParam
  const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1)
  return {
    title: `Concerts et Soirées à ${formattedCityName} | Où Sortir ce Soir - Goazen!`,
    description: `Agenda des concerts et soirées à ${formattedCityName} : rock, électro, DJ sets. Découvrez la programmation des salles de concert au Pays Basque et dans les Landes.`,
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
  const cityParam = (await params).city
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }
  const [locations, city] = await Promise.all([
    getLocations({ cityName: cityParam, limit: 100 }),
    getCity(cityParam),
  ])

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
      <h1 className="text-center text-4xl font-bold">Concerts, soirées et DJ sets à {city.name}</h1>
      <h2 className="text-center text-2xl py-4">Les évènements à venir:</h2>
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

      <div className={cn(darkerGrotesque.className, 'max-w-full mx-auto px-6 py-8 text-gray-800')}>
        <h2 className="text-2xl font-bold mb-4">Concerts, DJ sets et soirées à {city.name}</h2>
        <p className="mb-4">{city.description}</p>
        <h2 className="text-2xl font-bold mb-4">Où écouter de la musique à {city.name} :</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4 px-12 pb-16">
          {locations.docs
            .reduce((acc, location, index) => {
              if (index % 5 === 0) {
                acc.push([])
              }
              acc[acc.length - 1].push(
                <li key={location.id}>
                  <Link href={`/concerts/${city.slug}/${location.slug}`}>
                    <h3 className="text-lg font-bold hover:text-white transition-all">
                      {location.name}
                    </h3>
                  </Link>
                </li>,
              )
              return acc
            }, [] as JSX.Element[][])
            .map((column, colIndex) => (
              <ul key={colIndex} className="space-y-2">
                {column}
              </ul>
            ))}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Concerts et soirées près de {city.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-2 px-12 pb-32">
            {city.cities_related?.map((city) => {
              if (typeof city === 'string') {
                return null
              }
              return (
                <Link
                  href={`/concerts/${city.slug}`}
                  key={city.id}
                  className="text-lg font-bold hover:text-white transition-all"
                >
                  {city.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

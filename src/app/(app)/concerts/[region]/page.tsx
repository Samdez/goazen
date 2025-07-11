import { getCachedEvents } from '../../queries/get-events'
import { getPlaceholderImage } from '../../queries/get-placeholder-image'
import { PacmanLoader } from 'react-spinners'
import { getCities } from '../../queries/get-cities'
import UnifiedFilterSections from '../../components/UnifiedFilterSection'
import { CityFilterCombobox } from '../../components/CityFilterCombobox'
import { Suspense } from 'react'
import EventsGrid from '../../components/EventsGrid'
import { cn } from '@/lib/utils'
import { darkerGrotesque } from '../../fonts'
import Link from 'next/link'
import { REGIONS } from '../../constants'

export async function generateStaticParams() {
  return REGIONS.map((region) => ({
    region,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  const formattedRegionName = region === 'pays-basque' ? 'Pays Basque' : 'Landes'

  return {
    title: `Concerts et Soirées ${region === 'pays-basque' ? 'au' : 'dans les'} ${formattedRegionName} | Goazen!`,
    description: `Agenda complet des concerts et soirées ${region === 'pays-basque' ? 'au' : 'dans les'} ${formattedRegionName}. Découvrez tous les événements musicaux à venir.`,
    alternates: {
      canonical: `https://goazen.info/concerts/${region}`,
    },
    openGraph: {
      title: `Concerts et Soirées ${region === 'pays-basque' ? 'au' : 'dans les'} ${formattedRegionName} | Agenda Complet`,
      description: `Agenda des concerts et soirées ${region === 'pays-basque' ? 'au' : 'dans les'} ${formattedRegionName}. Trouvez votre prochaine sortie !`,
      url: `https://goazen.info/concerts/${region}`,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Concerts ${region === 'pays-basque' ? 'au' : 'dans les'} ${formattedRegionName} | Agenda Complet`,
      description: `Agenda des concerts et soirées ${region === 'pays-basque' ? 'au' : 'dans les'} ${formattedRegionName}. Trouvez votre prochaine sortie !`,
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

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  const [cities, placeholderImage, events] = await Promise.all([
    getCities(region),
    getPlaceholderImage(),
    getCachedEvents({
      region,
      startDate: new Date().toISOString(),
    }),
  ])

  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

  return (
    <>
      <Suspense
        key={region}
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <UnifiedFilterSections
          title={`Concerts, soirées et DJ sets ${region === 'pays-basque' ? 'au Pays Basque' : 'dans les Landes'}`}
          subTitle="Tous les concerts et soirées à venir:"
          buttons={[
            <CityFilterCombobox
              key="city-filter"
              cities={[
                ...cities.docs,
                { id: 'all', name: 'Toutes les villes', createdAt: '', updatedAt: '' },
              ]}
            />,
          ]}
        />
        <EventsGrid
          initialEvents={events.docs}
          initialNextPage={events.nextPage}
          hasNextPageProps={events.hasNextPage}
          startDate={new Date().toISOString()}
          placeholderImageUrl={placeholderImage}
          region={region}
        />
      </Suspense>

      <div className={cn(darkerGrotesque.className, 'max-w-full mx-auto px-6 py-8 text-gray-800')}>
        {region === 'pays-basque' ? (
          <>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">Concerts et DJ Sets au Pays Basque</h2>
              <p className="mb-4">
                Le Pays Basque, terre de traditions et de modernité, offre une scène musicale
                vibrante et diversifiée. De Biarritz à Bayonne, en passant par Saint-Jean-de-Luz et
                Hendaye, chaque ville contribue à créer un paysage musical unique où se mêlent
                musiques traditionnelles basques et sonorités contemporaines.
              </p>

              <h3 className="text-xl font-bold mb-3">Une scène musicale riche et variée</h3>
              <p className="mb-4">
                La région regorge de salles de concert emblématiques et de lieux culturels
                dynamiques. L&apos;Atabal à Biarritz, les Arènes de Bayonne, ou encore le Magnéto à
                Bayonne proposent une programmation éclectique allant du rock à l&apos;électro, en
                passant par le jazz et les musiques du monde. Les bars et clubs de la côte basque
                sont également réputés pour leurs soirées animées et leurs DJ sets qui font vibrer
                les nuits basques.
              </p>

              <h3 className="text-xl font-bold mb-3">
                Des festivals et événements toute l&apos;année
              </h3>
              <p className="mb-4">
                Le Pays Basque s&apos;anime tout au long de l&apos;année avec des événements
                musicaux majeurs. Les fêtes de Bayonne, le festival EHZ, ou encore le FestiLasai
                sont autant d&apos;occasions de découvrir des artistes locaux et internationaux.
                L&apos;été, les concerts en plein air se multiplient, offrant des moments magiques
                entre mer et montagne, tandis que l&apos;hiver, les salles couvertes prennent le
                relais avec une programmation tout aussi riche.
              </p>

              <h3 className="text-xl font-bold mb-3">Une culture musicale unique</h3>
              <p className="mb-4">
                La musique au Pays Basque, c&apos;est aussi la rencontre entre tradition et
                modernité. Les groupes de rock basque côtoient les DJ sets électro, créant une
                identité musicale unique. Les bars se transforment en lieux de concerts, les places
                des villages accueillent des concerts improvisés, et les frontons deviennent des
                scènes à ciel ouvert.
              </p>

              <h3 className="text-xl font-bold mb-3">
                Découvrez tous les concerts près de chez vous
              </h3>
              <p className="mb-4">
                Notre agenda des concerts au Pays Basque est mis à jour quotidiennement pour vous
                permettre de ne manquer aucun événement. Que vous soyez amateur de rock, de musique
                électronique, de jazz ou de musique traditionnelle, vous trouverez forcément un
                concert ou une soirée qui vous correspond. Consultez les dates, réservez vos places
                et vivez des moments inoubliables au rythme de la musique basque !
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Concerts et soirées au Pays Basque</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-2 pb-4">
                {cities.docs.map((city) => {
                  if (typeof city === 'string') {
                    return null
                  }
                  return (
                    <Link
                      href={`/concerts/${region}/${city.slug}`}
                      key={city.id}
                      className="text-lg font-bold hover:text-white transition-all"
                    >
                      {city.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">Concerts et DJ Sets dans les Landes</h2>
              <p className="mb-4">
                Les Landes, entre océan et forêts de pins, offrent une scène musicale dynamique et
                authentique. De Capbreton à Hossegor, en passant par Seignosse et Soustons, chaque
                ville propose une programmation musicale riche qui anime les soirées landaises tout
                au long de l&apos;année.
              </p>

              <h3 className="text-xl font-bold mb-3">Une scène musicale en plein essor</h3>
              <p className="mb-4">
                La région compte de nombreux lieux dédiés à la musique live et aux DJ sets. Les
                clubs d&apos;Hossegor, les salles de concert de Capbreton et les bars musicaux de
                Seignosse contribuent à faire vivre une scène musicale variée, où se côtoient rock,
                électro, reggae et musiques actuelles.
              </p>

              <h3 className="text-xl font-bold mb-3">Des événements qui rythment les saisons</h3>
              <p className="mb-4">
                Les Landes vibrent au rythme des festivals et des concerts tout au long de
                l&apos;année. L&apos;été, les plages s&apos;animent avec des DJ sets face à
                l&apos;océan, tandis que l&apos;arrière-saison accueille des concerts plus
                intimistes dans les salles mythiques de la région.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Concerts et soirées dans les Landes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-2 pb-4">
                {cities.docs.map((city) => {
                  if (typeof city === 'string') {
                    return null
                  }
                  return (
                    <Link
                      href={`/concerts/${region}/${city.slug}`}
                      key={city.id}
                      className="text-lg font-bold hover:text-white transition-all"
                    >
                      {city.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

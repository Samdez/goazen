import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { getLocation } from '@/app/(app)/queries/get-location'
import EventsCarousel from '@/app/(app)/components/EventsCarousel'
import { env } from 'env'
import RelatedLocationsAndCities from '@/app/(app)/components/RelatedLocationsAndCities'
import { getLocations } from '@/app/(app)/queries/get-locations'
import { getCity } from '@/app/(app)/queries/get-city'
import { RichTextWrapper } from '@/app/(app)/components/RichTextWrapper'
import Link from 'next/link'
import { JsonLd } from '@/app/(app)/components/JsonLd'
import { musicVenueJsonLd, OG_IMAGE } from '@/lib/structured-data'
import { formatDateLong } from '@/lib/format-event'
import { buildEventUrl } from '@/utils'
import { getPastEvents } from '@/app/(app)/queries/get-past-events'
import type { Metadata } from 'next'

// ISR: re-render periodically so the "upcoming events" filter (new Date())
// isn't frozen at build time.
export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; location: string; region: string }>
}): Promise<Metadata> {
  const { location: locationParam, region: regionParam, city: cityParam } = await params
  const canonical = `https://goazen.info/concerts/${regionParam}/${cityParam}/${locationParam}`
  try {
    const location = await getLocation(locationParam)
    if (!location) {
      return {
        title: 'Lieu introuvable | Goazen!',
        description: "Le lieu que vous recherchez n'existe pas.",
        robots: { index: false, follow: false },
      }
    }
    const cityName =
      typeof location['city V2'] === 'object' ? location['city V2']?.name : location.city

    // Prefer the plugin-seo meta group on the location doc when set.
    const title =
      location.meta?.title?.trim() ||
      `${location.name} à ${cityName} — concerts & soirées | Goazen!`
    const description = (
      location.meta?.description?.trim() ||
      `Programmation complète des concerts, DJ sets et soirées à ${location.name}, ${cityName}. Dates, billetterie et infos pratiques sur Goazen!`
    ).slice(0, 155)

    const locationImage =
      typeof location.image !== 'string' &&
      typeof location.image?.url === 'string' &&
      location.image?.url

    // Ensure we have a fully qualified URL for metadata
    const fullLocationImage =
      locationImage && typeof locationImage === 'string'
        ? locationImage.startsWith('http')
          ? locationImage
          : `https://goazen.info${locationImage}`
        : undefined

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Goazen!',
        images: fullLocationImage
          ? [
              {
                url: fullLocationImage,
                width: 1200,
                height: 630,
                alt: `Concerts à ${location.name} ${cityName}`,
              },
            ]
          : [OG_IMAGE],
        locale: 'fr_FR',
        type: 'website',
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
  } catch (error) {
    return {
      title: 'Lieu introuvable | Goazen!',
      description: "Le lieu que vous recherchez n'existe pas.",
      robots: { index: false, follow: false },
    }
  }
}

export async function generateStaticParams() {
  const locations = await getLocations({ limit: 100 })

  return locations.docs
    .map((location) => {
      const cityData = typeof location['city V2'] === 'object' ? location['city V2'] : null
      const region = cityData?.region || 'pays-basque' // default to pays-basque if no region specified
      const city = cityData?.slug || location.city

      return {
        region,
        city,
        location: location.slug,
      }
    })
    .filter((params) => params.region && params.city && params.location)
}

async function LocationPage({
  params,
}: {
  params: Promise<{ city: string; location: string; region: string }>
}) {
  const { location: locationParam, region: regionParam, city: cityParam } = await params
  const [location, city, relatedLocations, placeholderImageUrl] = await Promise.all([
    getLocation(locationParam),
    getCity(cityParam),
    getLocations({
      cityName: cityParam,
      limit: 100,
    }),
    getPlaceholderImage(),
  ])
  const events = await getCachedEvents({
    locationId: location.id,
    startDate: new Date().toISOString(),
  })
  // Une salle sans date à venir n'affichait qu'un « rien de prévu » : page vide,
  // jamais citée par un moteur. On montre alors ce qui s'y est déjà joué.
  const archive = events.docs.length ? null : await getPastEvents({ locationId: location.id })
  const cityName =
    typeof location['city V2'] === 'object' ? location['city V2']?.name : location.city

  const imageUrl =
    !(typeof location?.image === 'string') && location.image ? location.image?.url : ''

  const description = location.description_V2 || location.description

  const venueStructuredData = musicVenueJsonLd(
    location,
    // À défaut de programmation, on publie les dernières dates passées : elles
    // ont bien eu lieu ici, et sans elles le bloc n'apprend rien sur la salle.
    events.docs.length ? events.docs : (archive?.docs ?? []),
    {
      url: `https://goazen.info/concerts/${regionParam}/${cityParam}/${locationParam}`,
      region: regionParam,
      placeholderImage: placeholderImageUrl || undefined,
    },
  )

  return (
    <>
      <JsonLd id="venue-structured-data" data={venueStructuredData} />

      <div className="flex flex-col items-center gap-4 px-4 py-8">
        <h1 className="text-center text-4xl font-bold text-black">
          Tous les concerts, DJ sets, et soirées à {location.name} {cityName} :
        </h1>
        {events.docs.length ? (
          <EventsCarousel events={events.docs} placeholderImageUrl={placeholderImageUrl || ''} />
        ) : archive && archive.total > 0 ? (
          <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-black">
            <p className="text-center text-xl">
              Aucune date annoncée pour l&apos;instant.{' '}
              {archive.total === 1
                ? '1 concert référencé ici depuis 2024.'
                : `${archive.total} concerts référencés ici depuis 2024.`}
            </p>
            <div className="w-full">
              <h2 className="mb-2 text-2xl font-bold">Les dernières dates passées</h2>
              <ul className="flex flex-col gap-2">
                {archive.docs.map((event) => (
                  <li key={event.id}>
                    <Link href={buildEventUrl(event)} className="text-lg hover:text-white">
                      <span className="font-bold">{formatDateLong(event.date)}</span> — {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex h-36 items-center">
            <p className="text-4l text-black">Rien de prévu ici à notre connaissance...😔</p>
          </div>
        )}
        {imageUrl && (
          <Image
            className="mx-auto"
            src={imageUrl || ''}
            alt={location.name}
            width={640}
            height={640}
            unoptimized
          />
        )}
        {description && <RichTextWrapper data={description} />}

        <div className="flex w-full justify-center py-8">
          <iframe
            width="100%"
            height="450"
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/place?q=place_id:${location.place_id}&key=${env.GOOGLE_MAPS_API_KEY}`}
          ></iframe>
        </div>
        <RelatedLocationsAndCities
          locations={relatedLocations}
          regionParam={regionParam}
          city={city}
          sectionTitle={`Les autres lieux de concerts, soirées et DJ sets à ${cityName} :`}
        />
      </div>
    </>
  )
}

export default LocationPage

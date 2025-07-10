import { getSpecialEvent } from '@/app/(app)/queries/get-special-event'
import { getCachedEvents } from '@/app/(app)/queries/get-events'
import { getPlaceholderImage } from '@/app/(app)/queries/get-placeholder-image'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import EventsGrid from '@/app/(app)/components/EventsGrid'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { darkerGrotesque } from '@/app/(app)/fonts'
import styles from '@/app/(app)/styles.module.css'
import SelectionSwitch from '@/app/(app)/components/SelectionSwitch'
import { getCities } from '@/app/(app)/queries/get-cities'
import { getSpecialEvents } from '@/app/(app)/queries/get-special-events'
import { RichTextWrapper } from '@/app/(app)/components/RichTextWrapper'

export async function generateStaticParams() {
  const specialEvents = await getSpecialEvents()

  return specialEvents.docs.map((specialEvent) => ({
    slug: specialEvent.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const specialEventData = await getSpecialEvent(slug)

  if (!specialEventData.docs.length) {
    return {}
  }

  const specialEvent = specialEventData.docs[0]

  return {
    title: `${specialEvent.name} | Événement Spécial - Goazen!`,
    description:
      specialEvent.description ||
      `Découvrez l'événement spécial ${specialEvent.name} et tous les concerts associés.`,
    alternates: {
      canonical: `https://goazen.info/concerts/evenement/${slug}`,
    },
    openGraph: {
      title: `${specialEvent.name} | Événement Spécial - Goazen!`,
      description:
        specialEvent.description ||
        `Découvrez l'événement spécial ${specialEvent.name} et tous les concerts associés.`,
      url: `https://goazen.info/concerts/evenement/${slug}`,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${specialEvent.name} | Événement Spécial`,
      description:
        specialEvent.description ||
        `Découvrez l'événement spécial ${specialEvent.name} et tous les concerts associés.`,
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

export default async function SpecialEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ selectionOnly: string }>
}) {
  const { slug } = await params
  const { selectionOnly } = await searchParams
  const [specialEventData, placeholderImage, events] = await Promise.all([
    getSpecialEvent(slug),
    getPlaceholderImage(),
    getCachedEvents({
      specialEvent: slug,
      startDate: new Date().toISOString(),
      selectionOnly: selectionOnly === 'true' ? true : false,
    }),
  ])

  if (!specialEventData.docs.length) {
    notFound()
  }

  const specialEvent = specialEventData.docs[0]

  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
  }

  return (
    <>
      <div className="px-12 md:px-32">
        <div className="md:col-span-2 flex gap-4 justify-center">
          <RichTextWrapper data={specialEvent.description} />
        </div>
        <div className="flex items-center justify-center gap-2 py-8">
          <SelectionSwitch
            selectionOnly={selectionOnly === 'true' ? true : false}
            // onSelectionOnlyChange={}
            slug={slug}
          />
        </div>
      </div>
      <Suspense
        fallback={
          <div className="mx-auto mt-[14vh] flex min-h-screen w-full justify-center">
            <PacmanLoader />
          </div>
        }
      >
        <EventsGrid
          initialEvents={events.docs}
          initialNextPage={events.nextPage}
          hasNextPageProps={events.hasNextPage}
          startDate={new Date().toISOString()}
          placeholderImageUrl={placeholderImage}
          specialEvent={slug}
          selectionOnly={selectionOnly === 'true'}
        />
      </Suspense>
    </>
  )
}

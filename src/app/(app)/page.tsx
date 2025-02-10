import { getCachedEvents } from './queries/get-events'
import { z } from 'zod'
import EventsGrid from './components/EventsGrid'
import { getPlaceholderImage } from './queries/get-placeholder-image'
import { Suspense } from 'react'
import { PacmanLoader } from 'react-spinners'
import FilterSection from './components/FilterSection'
import { getCategories } from './queries/get-categories'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
  const { activeTime, startDate, endDate } = searchParamsSchema.parse(currSearchParams)

  let date: string
  if (!startDate) {
    date = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  } else {
    date = startDate
  }
  const categories = await getCategories()
  const initialEvents = await getCachedEvents({ startDate: date })
  const placeholderImage = await getPlaceholderImage()
  if (!placeholderImage) {
    console.error('No placeholder image found')
    return
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
      <FilterSection activeTime={activeTime} categories={categories} />
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
          startDate={date}
          endDate={endDate}
          placeholderImageUrl={placeholderImage}
        />
      </Suspense>
    </>
  )
}

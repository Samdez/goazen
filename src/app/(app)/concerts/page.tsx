import { notFound, redirect } from 'next/navigation'
import { getSpecialEvent } from '../queries/get-special-event'
import { REGIONS } from '../constants'

export default async function ConcertsPage({ params }: { params: Promise<{ slug: string }> }) {
  const segment = (await params).slug

  if (!segment) {
    redirect('/concerts/pays-basque')
  }

  if (REGIONS.includes(segment)) {
    redirect(`/concerts/(regions)/${segment}`)
  }

  const specialEventExists = await checkIfSpecialEventExists(segment)

  if (specialEventExists) {
    redirect(`/concerts/(special-events)/${segment}`)
  }

  notFound()
}

async function checkIfSpecialEventExists(slug: string): Promise<boolean> {
  try {
    const specialEvent = await getSpecialEvent(slug)
    return specialEvent.docs.length > 0
  } catch (error) {
    console.error('Error checking special event:', error)
    return false
  }
}

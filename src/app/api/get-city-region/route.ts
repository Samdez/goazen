import { payload } from '@/app/(app)/(client)/payload-client'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

const getCityRegion = (city: string) =>
  unstable_cache(
    async () => {
      const cityData = await payload.find({
        collection: 'cities',
        where: {
          or: [{ slug: { equals: city } }, { name: { equals: city } }],
        },
        limit: 1,
        depth: 0,
      })
      return cityData.docs[0]?.region || 'pays-basque'
    },
    ['city-region', city],
    { tags: ['cities'], revalidate: 60 * 60 * 24 },
  )()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
  }

  try {
    const region = await getCityRegion(city)
    return NextResponse.json({ region })
  } catch (error) {
    console.error('Error looking up city:', error)
    return NextResponse.json({ region: 'pays-basque' })
  }
}

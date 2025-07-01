import { payload } from '@/app/(app)/(client)/payload-client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
  }

  try {
    const cityData = await payload.find({
      collection: 'cities',
      where: {
        or: [{ slug: { equals: city } }, { name: { equals: city } }],
      },
    })

    return NextResponse.json({
      region: cityData.docs[0]?.region || 'pays-basque',
    })
  } catch (error) {
    console.error('Error looking up city:', error)
    return NextResponse.json({ region: 'pays-basque' })
  }
}

import { payload } from '@/app/(app)/client/payload-client'
export async function GET() {
  return Response.json({ hello: 'world' })
}
export const POST = async () => {
  try {
    const event = await payload.update({
      collection: 'events',
      where: { slug: { equals: 'rock_tribute_night_ballbreaker_motorqueens' } },
      data: { _status: 'published' },
    })

    return Response.json({ migratedEvents: event.docs.map((doc) => doc.id), now: Date.now() })
  } catch (error) {
    console.error('Error migrating events:', error)
    return Response.json({ error: 'Error migrating events' }, { status: 500 })
  }
}

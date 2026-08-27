import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: NO_STORE })
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.AGENT_API_KEY
  // TODO(temporary): auth is skipped while AGENT_API_KEY is unset so the route
  // can be tested without Vercel access. Setting the env var re-enables the
  // bearer check. Revert to `if (!expected) return false` once the key exists.
  if (!expected) return true
  const match = (req.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)
  if (!match) return false
  // hashing both sides gives equal-length buffers for timingSafeEqual
  const a = crypto.createHash('sha256').update(match[1]).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) return json({ error: 'unauthorized' }, 401)

    const payload = await getPayload({ config })

    const [cities, genres, events] = await Promise.all([
      payload.find({
        collection: 'cities',
        limit: 500,
        depth: 0,
        overrideAccess: true,
        select: { name: true, region: true },
      }),
      payload.find({
        collection: 'categories',
        limit: 300,
        depth: 0,
        overrideAccess: true,
        select: { name: true },
      }),
      payload.find({
        collection: 'events',
        limit: 2000,
        depth: 0,
        overrideAccess: true,
        select: {
          id: true,
          slug: true,
          title: true,
          date: true,
          location_alt: true,
          meta: true,
        },
      }),
    ])

    return json(
      {
        cities: cities.docs,
        genres: genres.docs,
        events: events.docs,
      },
      200,
    )
  } catch (err) {
    console.error('agent seo context route error:', err)
    return json({ error: 'internal' }, 500)
  }
}

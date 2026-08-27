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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isAuthorized(req)) return json({ error: 'unauthorized' }, 401)

    const { id } = await params

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return json({ error: 'invalid JSON body' }, 400)
    }

    const { meta } = (body ?? {}) as { meta?: { title?: unknown; description?: unknown } }
    const title = meta?.title
    const description = meta?.description

    if (typeof title !== 'string' || typeof description !== 'string') {
      return json({ error: 'meta.title and meta.description are required strings' }, 400)
    }

    const payload = await getPayload({ config })

    const existing = await payload
      .findByID({ collection: 'events', id, depth: 0, overrideAccess: true })
      .catch(() => null)
    if (!existing) return json({ error: 'event not found' }, 404)

    const updated = await payload.update({
      collection: 'events',
      id,
      overrideAccess: true,
      data: { meta: { title, description } },
    })

    return json(updated, 200)
  } catch (err) {
    console.error('agent event meta route error:', err)
    return json({ error: 'internal' }, 500)
  }
}

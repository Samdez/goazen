import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { lexicalToPlainText } from '@/utils'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

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
    const result = await payload.find({
      collection: 'pages',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
      select: { title: true, slug: true, published: true, meta: true },
    })

    return json({ pages: result.docs }, 200)
  } catch (err) {
    console.error('agent pages route error:', err)
    return json({ error: 'internal' }, 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthorized(req)) return json({ error: 'unauthorized' }, 401)

    const slug = req.nextUrl.searchParams.get('slug')
    if (!slug || !SLUG_RE.test(slug)) {
      return json({ error: 'slug query param is required (^[a-z0-9]+(-[a-z0-9]+)*$)' }, 400)
    }

    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      return json({ error: `no page with slug "${slug}"` }, 404)
    }

    await payload.delete({ collection: 'pages', id: existing.docs[0].id, overrideAccess: true })
    return json({ ok: true, deleted: slug }, 200)
  } catch (err) {
    console.error('agent pages route error:', err)
    return json({ error: 'internal' }, 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) return json({ error: 'unauthorized' }, 401)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return json({ error: 'invalid JSON body' }, 400)
    }

    const { title, slug, meta, published, content } = (body ?? {}) as {
      title?: unknown
      slug?: unknown
      meta?: { title?: unknown; description?: unknown }
      published?: unknown
      content?: unknown
    }

    if (typeof title !== 'string' || !title.trim()) {
      return json({ error: 'title is required' }, 400)
    }
    if (typeof slug !== 'string' || !slug.trim()) {
      return json({ error: 'slug is required' }, 400)
    }
    if (!SLUG_RE.test(slug)) {
      return json({ error: 'slug must match ^[a-z0-9]+(-[a-z0-9]+)*$' }, 400)
    }

    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      return json({ error: `a page with slug "${slug}" already exists` }, 409)
    }

    const contentValue =
      content && typeof content === 'object' ? (content as Record<string, unknown>) : undefined

    const metaTitle = (
      typeof meta?.title === 'string' && meta.title.trim() ? meta.title.trim() : title.trim()
    ).slice(0, 60)
    const metaDescription = (
      typeof meta?.description === 'string' && meta.description.trim()
        ? meta.description.trim()
        : (contentValue && lexicalToPlainText(contentValue as never)) || title.trim()
    ).slice(0, 160)

    const created = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      data: {
        title: title.trim(),
        slug,
        published: typeof published === 'boolean' ? published : true,
        ...(contentValue ? { content: contentValue as never } : {}),
        meta: { title: metaTitle, description: metaDescription },
      },
    })

    return json(created, 201)
  } catch (err) {
    console.error('agent pages route error:', err)
    return json({ error: 'internal' }, 500)
  }
}

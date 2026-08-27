import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { _getEvents } from '@/app/(app)/queries/get-events'
import { REGIONS } from '@/app/(app)/constants'
import { computeWeekendWindow, mapEventToAgentEvent, sortAgentEvents } from '@/lib/agent-events'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }
const MAX_EVENTS = 100
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: NO_STORE })
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.AGENT_API_KEY
  if (!expected) return false
  const match = (req.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)
  if (!match) return false
  // hashing both sides gives equal-length buffers for timingSafeEqual
  const a = crypto.createHash('sha256').update(match[1]).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(a, b)
}

function isValidDate(s: string): boolean {
  return DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T12:00:00Z`).getTime())
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) return json({ error: 'unauthorized' }, 401)

    const params = req.nextUrl.searchParams
    const scope = params.get('scope')
    const startParam = params.get('startDate')
    const endParam = params.get('endDate')
    const region = params.get('region')

    if (scope && (startParam || endParam)) {
      return json({ error: 'scope and startDate/endDate are mutually exclusive' }, 400)
    }
    if (scope && scope !== 'weekend') {
      return json({ error: 'invalid scope, expected "weekend"' }, 400)
    }
    if (region && !REGIONS.includes(region)) {
      return json({ error: `invalid region, expected one of: ${REGIONS.join(', ')}` }, 400)
    }

    let startDate: string
    let endDate: string
    if (scope === 'weekend') {
      ;({ startDate, endDate } = computeWeekendWindow())
    } else if (startParam || endParam) {
      if (!startParam || !endParam) {
        return json({ error: 'startDate and endDate are both required' }, 400)
      }
      if (!isValidDate(startParam) || !isValidDate(endParam)) {
        return json({ error: 'dates must be YYYY-MM-DD' }, 400)
      }
      if (endParam < startParam) {
        return json({ error: 'endDate must not be before startDate' }, 400)
      }
      startDate = startParam
      endDate = endParam
    } else {
      return json({ error: 'scope=weekend or startDate/endDate is required' }, 400)
    }

    const result = await _getEvents({
      startDate,
      endDate,
      region: region ?? undefined,
      limit: MAX_EVENTS * 2,
      page: 1,
    })

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? ''
    const events = sortAgentEvents(
      result.docs
        .map((event) => mapEventToAgentEvent(event, baseUrl))
        // _getEvents widens the window at UTC boundaries; clip to exact Paris-local days
        .filter((e) => e.date >= startDate && e.date <= endDate),
    ).slice(0, MAX_EVENTS)

    return json({ events }, 200)
  } catch (err) {
    console.error('agent events route error:', err)
    return json({ error: 'internal' }, 500)
  }
}

import type { Event as PayloadEvent } from '@/payload-types'
import { formatPrice } from '@/lib/format-event'

const PARIS_TZ = 'Europe/Paris'

export function parisDateString(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function parisDayName(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, weekday: 'long' })
    .format(d)
    .toLowerCase()
}

function addDays(dateStr: string, days: number): string {
  // noon UTC anchor avoids DST edge cases when shifting whole days
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Thu–Sun window containing "today" (Paris) if we're already inside it,
 * otherwise the next upcoming one. Mon–Thu → this week's Thursday;
 * Fri–Sun → the Thursday that already passed (agent renders Thu→Sun).
 */
export function computeWeekendWindow(now: Date = new Date()): {
  startDate: string
  endDate: string
} {
  const today = parisDateString(now)
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay() // 0=Sun..6=Sat
  const isoDow = dow === 0 ? 7 : dow // Mon=1..Sun=7
  const startDate = addDays(today, 4 - isoDow) // Thursday = 4
  return { startDate, endDate: addDays(startDate, 3) }
}

// ---------- time ----------

function parseTimeTo24h(token: string): string | null {
  const m = token.trim().match(/^(\d{1,2})\s*[hH:.]?\s*(\d{2})?$/)
  if (!m) return null
  const h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  if (h > 29 || min > 59) return null // "26h" style after-midnight notation allowed
  return `${String(h % 24).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/**
 * Free-text time field → "HH:MM-HH:MM" (ASCII hyphen), "HH:MM" when only a
 * start time is known, or null.
 */
export function formatTimeRange(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s || s === '0' || s.toLowerCase() === 'tba') return null

  const parts = s.split(/\s*(?:[-–/]|\s+a\s+|\s+à\s+|\s+to\s+)\s*/i)
  if (parts.length === 2) {
    const start = parseTimeTo24h(parts[0])
    const end = parseTimeTo24h(parts[1])
    if (start && end) return `${start}-${end}`
    if (start) return start
  }
  return parseTimeTo24h(s)
}

// ---------- per-field mapping ----------

const EVENT_KIND_LABELS: Record<string, string> = {
  dj_set: 'DJ SET',
  live_show: 'LIVE SHOW',
  other: 'AUTRE',
}

export function formatAgentEventKind(kind: PayloadEvent['event_kind']): string {
  return (kind && EVENT_KIND_LABELS[kind]) || 'CONCERT'
}

export function splitGenres(raw: string | null | undefined): string[] {
  if (!raw) return []
  return String(raw)
    .split(/[,/•·+]|\s+x\s+|&/i)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.toLocaleUpperCase('fr-FR'))
}

export function formatAgentPrice(event: Pick<PayloadEvent, 'price' | 'sold_out'>): string | null {
  // "12 16" (broken separator in source data) → "12-16€"
  const bareRange = (event.price ?? '')
    .trim()
    .match(/^(\d+(?:[.,]\d{1,2})?)\s+(\d+(?:[.,]\d{1,2})?)$/)
  if (!event.sold_out && bareRange) return `${bareRange[1]}-${bareRange[2]}€`

  const formatted = formatPrice({ price: event.price, sold_out: event.sold_out })
  if (formatted === 'Prix à confirmer') return null
  return formatted.replace(/[\u00A0\u202F]/g, ' ')
}

export type AgentEvent = {
  title: string
  date: string
  time: string | null
  day: string
  venue: string
  city: string
  region: string
  genres: string[]
  price: string | null
  event_kind: string
  image: string
  ticketing_url: string | null
  slug: string
}

export function mapEventToAgentEvent(event: PayloadEvent, baseUrl: string): AgentEvent {
  const eventDate = new Date(event.date)

  let venue = ''
  let city = ''
  let region: string = event.region ?? ''
  if (event.location && typeof event.location === 'object') {
    venue = event.location.name ?? ''
    const cityV2 = event.location['city V2']
    if (cityV2 && typeof cityV2 === 'object') {
      city = cityV2.name ?? ''
      region = cityV2.region ?? region
    } else if (event.location.city) {
      city = String(event.location.city).replace(/[-_]/g, ' ')
    }
  } else if (event.location_alt) {
    venue = event.location_alt
  }

  let image = ''
  if (event.image && typeof event.image === 'object' && event.image.url) {
    image = event.image.url.startsWith('http')
      ? event.image.url
      : `${baseUrl.replace(/\/$/, '')}${event.image.url}`
  }

  return {
    title: event.title.trim().toLocaleUpperCase('fr-FR'),
    date: parisDateString(eventDate),
    time: formatTimeRange(event.time),
    day: parisDayName(eventDate),
    venue: venue.toLocaleUpperCase('fr-FR'),
    city: city.toLocaleUpperCase('fr-FR'),
    region,
    genres: splitGenres(event.genres),
    price: formatAgentPrice(event),
    event_kind: formatAgentEventKind(event.event_kind),
    image,
    ticketing_url: event.ticketing_url || null,
    slug: event.slug ?? '',
  }
}

function startMinutes(time: string | null): number {
  if (!time) return Number.POSITIVE_INFINITY // null times last
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
}

export function sortAgentEvents(events: AgentEvent[]): AgentEvent[] {
  return [...events].sort(
    (a, b) => a.date.localeCompare(b.date) || startMinutes(a.time) - startMinutes(b.time),
  )
}

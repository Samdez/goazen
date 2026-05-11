import type { City, Event, Location } from '@/payload-types'

const NBSP = ' '
const EN_DASH = '–'

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
const DAYS_FR_LONG = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAYS_FR_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const PARIS_TZ = 'Europe/Paris'

function getParisDateParts(d: Date) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(d)
  const m: Record<string, string> = {}
  for (const p of f) m[p.type] = p.value
  return {
    year: Number(m.year),
    month: Number(m.month),
    day: Number(m.day),
    hour: Number(m.hour === '24' ? '0' : m.hour),
    minute: Number(m.minute),
    weekday: m.weekday,
  }
}

// ---------- TIME ----------

const TIME_TOKEN = /(\d{1,2})\s*[hH:]\s*(\d{0,2})?/

function parseTimeToken(token: string): string | null {
  const t = token.trim()
  if (!t) return null
  const m = t.match(/^(\d{1,2})\s*[hH:]?\s*(\d{2})?$/) ?? t.match(TIME_TOKEN)
  if (!m) return null
  const h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  if (Number.isNaN(h) || Number.isNaN(min)) return null
  if (h > 29 || min > 59) return null
  return `${String(h).padStart(2, '')}h${min ? String(min).padStart(2, '0') : ''}`
}

export function formatTime(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s || s === '0' || s.toLowerCase() === 'tba') return null

  // range separators: -, –, /, " a ", " to ", " à "
  const rangeSplit = s.split(/\s*(?:[-–/]|\s+a\s+|\s+à\s+|\s+to\s+)\s*/i)
  if (rangeSplit.length === 2) {
    const left = parseTimeToken(rangeSplit[0])
    const right = parseTimeToken(rangeSplit[1])
    if (left && right) return `${left}${EN_DASH}${right}`
    if (left && !right) return left
  }

  const single = parseTimeToken(s)
  if (single) return single
  return null
}

// ---------- PRICE ----------

const FREE_RE = /^(gratuit|gratis|free|entrée libre)\s*[!.]*\s*€?$/i
const TBD_RE = /^(non précisé|n\/a|à confirmer|à venir|tba|tbd|\?+)$/i

function normalizeEuro(s: string): string {
  // "20€"  → "20 €" with NBSP. "20 €" stays. "20 €" already fine.
  return s.replace(/(\d)\s*€/g, `$1${NBSP}€`).trim()
}

export function formatPrice(opts: { price?: string | null; sold_out?: boolean | null }): string {
  if (opts.sold_out) return 'Complet'
  const raw = (opts.price ?? '').toString().trim()
  if (!raw) return 'Prix à confirmer'
  if (raw === '0' || FREE_RE.test(raw)) return 'Gratuit'
  if (TBD_RE.test(raw)) return 'Prix à confirmer'

  // pure integer / decimal → "25 €"
  if (/^\d+([.,]\d{1,2})?$/.test(raw)) {
    return `${raw.replace(',', '.')}${NBSP}€`
  }

  // contains € — normalize spacing
  if (raw.includes('€')) return normalizeEuro(raw)

  // pattern like "12/15/22" → "12 € / 15 € / 22 €"
  if (/^\d+(?:\s*\/\s*\d+)+$/.test(raw)) {
    return raw
      .split('/')
      .map((n) => `${n.trim()}${NBSP}€`)
      .join(' / ')
  }

  // fallback: return raw
  return raw
}

// ---------- VENUE ----------

function cityNameFromLocation(loc: Location): string | null {
  const c = loc['city V2']
  if (c && typeof c === 'object') return (c as City).name ?? null
  if (loc.city) {
    const pretty = String(loc.city)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase())
    return pretty
  }
  return null
}

export function formatVenue(event: Event): string | null {
  if (event.location && typeof event.location === 'object') {
    const venueName = event.location.name
    const cityName = cityNameFromLocation(event.location)
    if (venueName && cityName) return `${venueName} · ${cityName}`
    if (venueName) return venueName
  }
  if (event.location_alt) return event.location_alt
  return null
}

// ---------- GENRE ----------

const ACRONYMS = new Set([
  'DJ',
  'UKG',
  'DNB',
  'IDM',
  'RNB',
  'RnB',
  'EDM',
  'RAP',
  'US',
  'UK',
  'PB',
  'NRJ',
  'BPM',
  'MC',
])

function titleCaseToken(tok: string): string {
  const t = tok.trim()
  if (!t) return ''
  const up = t.toUpperCase()
  if (ACRONYMS.has(up)) return up === 'RNB' ? 'RnB' : up
  return t
    .toLowerCase()
    .split(/(\s+|[/])/)
    .map((p) => (p.match(/[a-zà-ÿ]/i) ? p.charAt(0).toUpperCase() + p.slice(1) : p))
    .join('')
}

export function formatGenre(raw: string | null | undefined, maxTokens = 4): string | null {
  if (!raw) return null
  const s = String(raw).trim()
  if (!s) return null
  const tokens = s
    .split(/[,\/•·]| x |&/i)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(titleCaseToken)
    .filter(Boolean)
  if (!tokens.length) return null
  const trimmed = tokens.slice(0, maxTokens)
  const joined = trimmed.join(' · ')
  return tokens.length > maxTokens ? `${joined}…` : joined
}

// ---------- EVENT KIND ----------

export function formatEventType(kind: Event['event_kind']): string | null {
  switch (kind) {
    case 'dj_set':
      return 'DJ Set'
    case 'live_show':
      return 'Live'
    default:
      return null
  }
}

// ---------- DATES ----------

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const { day, month, weekday } = getParisDateParts(d)
  const dayName = mapWeekdayShort(weekday)
  return `${dayName} ${day} ${MONTHS_FR[month - 1]}`
}

export function formatDateRow(date: string | Date): { day: string; monthDow: string } {
  const d = typeof date === 'string' ? new Date(date) : date
  const { day, month, weekday } = getParisDateParts(d)
  const dow = mapWeekdayShort(weekday).slice(0, 3)
  const monthShort = MONTHS_FR[month - 1].slice(0, 3)
  const monthCap = monthShort.charAt(0).toUpperCase() + monthShort.slice(1)
  return { day: String(day).padStart(2, '0'), monthDow: `${monthCap} · ${dow}` }
}

function mapWeekdayShort(en: string): string {
  const map: Record<string, string> = {
    Sun: DAYS_FR_LONG[0],
    Mon: DAYS_FR_LONG[1],
    Tue: DAYS_FR_LONG[2],
    Wed: DAYS_FR_LONG[3],
    Thu: DAYS_FR_LONG[4],
    Fri: DAYS_FR_LONG[5],
    Sat: DAYS_FR_LONG[6],
  }
  return map[en] ?? en
}

// ---------- TONIGHT WINDOW ----------

export function isTonight(date: string | Date, now: Date = new Date()): boolean {
  const target = typeof date === 'string' ? new Date(date) : date
  const t = getParisDateParts(target)
  const n = getParisDateParts(now)

  // event start same Paris-local day as now
  if (t.year === n.year && t.month === n.month && t.day === n.day) return true

  // post-midnight events (00:00–05:59 next morning) still count as "ce soir"
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const tm = getParisDateParts(tomorrow)
  if (t.year === tm.year && t.month === tm.month && t.day === tm.day && t.hour < 6) {
    return true
  }
  return false
}

// Exported for queries
export { DAYS_FR_LONG, DAYS_FR_SHORT, MONTHS_FR, PARIS_TZ }

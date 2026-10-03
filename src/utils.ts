import slugify from 'slugify'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Event } from './payload-types'
import {
  UNKNOWN_CITY_SEGMENT,
  UNKNOWN_REGION_SEGMENT,
  UNKNOWN_VENUE_SEGMENT,
} from './lib/url-segments'

export {
  PLACEHOLDER_SEGMENTS,
  UNKNOWN_CITY_SEGMENT,
  UNKNOWN_REGION_SEGMENT,
  UNKNOWN_VENUE_SEGMENT,
} from './lib/url-segments'

export function slugifyString(string: string) {
  const slug = string.replace('/', '-')
  return slugify(slug, { replacement: '-', lower: true, trim: true })
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LexicalNode = { text?: string; children?: unknown[] }

// Flattens a Payload Lexical richText value to a single plain-text string.
// Used for meta descriptions (the raw value is a JSON object, not a string).
// `children` is typed loosely (unknown[]) so the generated payload-types
// richText shape is assignable without a cast at the call site.
export function lexicalToPlainText(
  data?: { root?: { children?: unknown[] } } | null,
): string {
  const walk = (nodes?: unknown[]): string =>
    (nodes ?? [])
      .map((n) => {
        const node = (n ?? {}) as LexicalNode
        return typeof node.text === 'string' ? node.text : walk(node.children)
      })
      .join('')
  return walk(data?.root?.children)
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Paris',
  }
  return new Date(date).toLocaleDateString('fr-FR', options)
}

// An event is "past" only once its whole calendar day (Europe/Paris) is over —
// the stored `date` is the start timestamp, so comparing it to `new Date()`
// would mark tonight's concert as finished while it is still running.
export function isEventPast(date: string): boolean {
  const parisDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' })
  return parisDay(new Date(date)) < parisDay(new Date())
}

function getEndOfWeek(date: Date) {
  const lastday = date.getDate() - (date.getDay() - 1) + 6
  return new Date(date.setDate(lastday)).toISOString().split('T')[0]
}

export function createHref({
  time,
  category,
  activeTime,
}: {
  time?: 'day' | 'week'
  category?: string
  activeTime?: string
}): string {
  const today = new Date().toISOString().split('T')[0]
  const dayLimit = `startDate=${today}&endDate=${today}&activeTime=day`
  const weekLimit = `startDate=${today}&endDate=${getEndOfWeek(new Date())}&activeTime=week`
  let url = ''
  url += category ? (category === 'all' ? '/' : `/genres/${category}`) : '/'

  if (!activeTime) {
    if (time === 'day') return `${url}?${dayLimit}`
    if (time === 'week') return `${url}?${weekLimit}`
  }
  if (activeTime === 'day') {
    if (time === 'day') return url
    if (time === 'week') return `${url}?${weekLimit}`
  }
  if (activeTime === 'week') {
    if (time === 'day') return `${url}?${dayLimit}`
    if (time === 'week') return url
  }
  return url
}

export function buildEventUrl(event: Event) {
  const { region, citySlug, locationSlug } = getLocationInfo(event)
  return `/concerts/${region}/${citySlug}/${locationSlug}/${event.slug}_${event.id}`
}

/**
 * Découpe un `location_alt` saisi en texte libre (« Le Baya - Capbreton »).
 *
 * Convention de saisie : le lieu d'abord, la ville après un séparateur. Sans
 * séparateur, on ne sait pas deviner la ville — mieux vaut l'admettre que
 * publier un segment faux.
 */
function splitLocationAlt(alt?: string | null) {
  const parts = String(alt ?? '')
    .split(/[-/,]/)
    .map((part) => part.trim())
    .filter(Boolean)
  return { venueName: parts[0] ?? null, cityName: parts[1] ?? null }
}

export type LocationInfo = {
  citySlug: string
  cityName: string | null
  locationSlug: string
  locationName: string | null
  region: string
}

/**
 * De quoi construire l'URL d'un événement et nommer son lieu.
 *
 * Cascade volontaire, du plus fiable au moins fiable : la relation `city V2`
 * (qui porte aussi la région), puis l'enum `city` legacy des Locations d'avant
 * la migration, puis la ville lue dans le texte libre, puis un segment neutre.
 * Chaque étape sautée produisait avant une sentinelle dans l'URL canonique.
 */
export function getLocationInfo(event: Event): LocationInfo {
  const location = event.location && typeof event.location !== 'string' ? event.location : null
  const cityDoc =
    location && location['city V2'] && typeof location['city V2'] !== 'string'
      ? location['city V2']
      : null

  if (location) {
    const citySlug = cityDoc?.slug || location.city || null
    return {
      citySlug: citySlug || UNKNOWN_CITY_SEGMENT,
      cityName: cityDoc?.name || location.city || null,
      locationSlug: location.slug || slugify(location.name) || UNKNOWN_VENUE_SEGMENT,
      locationName: location.name || null,
      region: cityDoc?.region || event.region || UNKNOWN_REGION_SEGMENT,
    }
  }

  const { venueName, cityName } = splitLocationAlt(event.location_alt)
  return {
    citySlug: cityName ? slugify(cityName) : UNKNOWN_CITY_SEGMENT,
    cityName,
    locationSlug: venueName ? slugify(venueName) : UNKNOWN_VENUE_SEGMENT,
    locationName: venueName,
    region: event.region || UNKNOWN_REGION_SEGMENT,
  }
}

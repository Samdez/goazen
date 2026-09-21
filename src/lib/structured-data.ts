import type { Event } from '@/payload-types'
import { buildEventUrl, getLocationInfo } from '@/utils'
import { collectEventGenres, eventStartDateIso } from './format-event'

export const SITE_URL = 'https://goazen.info'

function regionLabel(region?: string | null): string | undefined {
  if (region === 'pays-basque') return 'Pays Basque'
  if (region === 'landes') return 'Landes'
  return undefined
}

/** getLocationInfo returns the sentinel 'no-location' when a city/venue can't be resolved. */
function clean(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'no-location') return undefined
  return trimmed
}

function absoluteUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${SITE_URL}${url}`
}

function eventImageUrl(event: Event, placeholderImage?: string): string | undefined {
  const fromEvent = typeof event.image === 'object' && event.image ? event.image.url : undefined
  return absoluteUrl(fromEvent) ?? absoluteUrl(placeholderImage)
}

/**
 * Event prices are stored as free text ("32 €", "Gratuit", "10 € / 5 € adhérents").
 * Pull a numeric value when one is unambiguously present so Google can show a price;
 * otherwise omit `price` and keep the offer to `url` + `availability` only.
 */
function parsePrice(price?: string | null): string | undefined {
  if (!price) return undefined
  if (/gratuit|free/i.test(price)) return '0'
  const match = price.match(/(\d+(?:[.,]\d+)?)/)
  return match ? match[1].replace(',', '.') : undefined
}

/**
 * Un event en schema.org `MusicEvent`.
 *
 * Source unique : pages de liste (via `eventsItemListJsonLd`), page événement
 * et page salle lisent toutes celle-ci. Sans `@context` — il est posé par
 * l'appelant, à la racine du bloc publié (cf. `eventJsonLd`).
 */
export function eventToJsonLd(event: Event, opts?: { placeholderImage?: string }) {
  const info = getLocationInfo(event)
  const region = regionLabel(info.region)
  const locationName = clean(info.locationName)
  const cityName = clean(info.cityName)
  const image = eventImageUrl(event, opts?.placeholderImage)
  const priceValue = parsePrice(event.price)
  const hasOffer = Boolean(event.ticketing_url) || priceValue !== undefined
  const genres = collectEventGenres(event)
  // Une salle référencée est un lieu de concert ; un `location_alt` en texte
  // libre n'est qu'une adresse approximative, d'où le `Place` générique.
  const venueType = event.location && typeof event.location === 'object' ? 'MusicVenue' : 'Place'

  return {
    '@type': 'MusicEvent',
    name: event.title,
    startDate: eventStartDateIso(event),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${SITE_URL}${buildEventUrl(event)}`,
    ...(event.description ? { description: event.description } : {}),
    ...(image ? { image } : {}),
    ...(genres.length ? { genre: genres } : {}),
    ...(locationName
      ? {
          location: {
            '@type': venueType,
            name: locationName,
            address: {
              '@type': 'PostalAddress',
              ...(cityName ? { addressLocality: cityName } : {}),
              ...(region ? { addressRegion: region } : {}),
              addressCountry: 'FR',
            },
          },
        }
      : {}),
    ...(hasOffer
      ? {
          offers: {
            '@type': 'Offer',
            ...(event.ticketing_url ? { url: event.ticketing_url } : {}),
            ...(priceValue !== undefined ? { price: priceValue, priceCurrency: 'EUR' } : {}),
            availability: event.sold_out
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          },
        }
      : {}),
  }
}

/** Le même `MusicEvent`, publiable seul (page événement). */
export function eventJsonLd(event: Event, opts?: { placeholderImage?: string }) {
  return {
    '@context': 'https://schema.org',
    ...eventToJsonLd(event, opts),
  }
}

export function eventsItemListJsonLd(events: Event[], opts?: { placeholderImage?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: eventToJsonLd(event, opts),
    })),
  }
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  }
}

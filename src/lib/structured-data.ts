import type { Event, Location } from '@/payload-types'
import { buildEventUrl, getLocationInfo, lexicalToPlainText } from '@/utils'
import { cityNameFromLocation, collectEventGenres, eventStartDateIso } from './format-event'

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

/**
 * Une salle en schema.org `MusicVenue`, avec sa programmation.
 *
 * Remplace l'objet écrit à la main dans la page : celui-ci publiait la
 * description Lexical brute (un objet JSON illisible pour un moteur), un
 * `GeoCoordinates` vide dès qu'un `place_id` existait, et des horaires
 * d'ouverture inventés (« vendredi et samedi 20h-2h ») identiques pour toutes
 * les salles. On ne publie plus que ce qu'on sait vraiment.
 */
export function musicVenueJsonLd(
  location: Location,
  events: Event[],
  opts: { url: string; region?: string | null; placeholderImage?: string },
) {
  const cityDoc = typeof location['city V2'] === 'object' ? location['city V2'] : null
  const cityName = clean(cityNameFromLocation(location))
  const region = regionLabel(cityDoc?.region ?? opts.region)
  const description = clean(
    lexicalToPlainText(location.description_V2) || lexicalToPlainText(location.description),
  )
  const image =
    absoluteUrl(typeof location.image === 'object' ? location.image?.url : undefined) ??
    absoluteUrl(opts.placeholderImage)

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicVenue',
    name: location.name,
    url: opts.url,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(cityName ? { addressLocality: cityName } : {}),
      ...(region ? { addressRegion: region } : {}),
      addressCountry: 'FR',
    },
    ...(events.length
      ? { event: events.map((event) => eventToJsonLd(event, opts)) }
      : {}),
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

import type { Event, Location } from '@/payload-types'
import { buildEventUrl, getLocationInfo, lexicalToPlainText } from '@/utils'
import { PLACEHOLDER_SEGMENTS } from './url-segments'
import { cityNameFromLocation, collectEventGenres, eventStartDateIso } from './format-event'
import { normalizeTicketingUrl } from './ticketing-url'

export const SITE_URL = 'https://goazen.info'

/**
 * Vignette de partage par défaut (1200×630), générée par `/og`.
 *
 * À poser explicitement dans chaque `openGraph` : un objet `openGraph` défini
 * par une page remplace celui du layout, images comprises.
 */
export const OG_IMAGE = {
  url: `${SITE_URL}/og`,
  width: 1200,
  height: 630,
  alt: 'Goazen! — agenda des concerts au Pays Basque et dans les Landes',
}

function regionLabel(region?: string | null): string | undefined {
  if (region === 'pays-basque') return 'Pays Basque'
  if (region === 'landes') return 'Landes'
  return undefined
}

/**
 * Un segment neutre (`ville-non-precisee`…) dit qu'on ne sait pas : le publier
 * comme nom de lieu affirmerait une adresse qui n'existe pas.
 */
function clean(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || PLACEHOLDER_SEGMENTS.has(trimmed)) return undefined
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
/** Les comptes officiels de Goazen!, pour `sameAs`. */
export const GOAZEN_PROFILES = ['https://www.instagram.com/goazen.info/']

export const GOAZEN_EMAIL = 'contact@goazen.info'

/**
 * L'éditeur du site, en `Organization`.
 *
 * Sans entité identifiable — des profils vérifiables, une zone couverte, un
 * contact — les moteurs génératifs traitent la source comme anonyme et la
 * citent moins volontiers. C'est le même bloc que celui de la page À propos :
 * deux définitions divergentes donneraient deux entités différentes.
 */
export function organizationJsonLd(opts?: { description?: string }) {
  return {
    '@type': 'Organization',
    name: 'Goazen!',
    url: SITE_URL,
    logo: `${SITE_URL}/GOAZEN_MASCOTTES.png`,
    description:
      opts?.description ??
      'Agenda des concerts, DJ sets et soirées au Pays Basque et dans les Landes. Gratuit, tenu bénévolement.',
    email: GOAZEN_EMAIL,
    sameAs: GOAZEN_PROFILES,
    foundingDate: '2024',
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Pays Basque' },
      { '@type': 'AdministrativeArea', name: 'Landes' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: GOAZEN_EMAIL,
      availableLanguage: ['fr'],
    },
  }
}

/**
 * Le site lui-même.
 *
 * Pas de `SearchAction` : Goazen! n'a pas de recherche texte, seulement des
 * filtres (ville, date, genre). Annoncer une recherche qui n'existe pas
 * donnerait une sitelinks searchbox cassée dans les résultats Google.
 */
export function webSiteJsonLd() {
  return {
    '@type': 'WebSite',
    name: 'Goazen!',
    alternateName: 'Goazen',
    url: SITE_URL,
    inLanguage: 'fr-FR',
    publisher: { '@type': 'Organization', name: 'Goazen!', url: SITE_URL },
  }
}

/** Organization + WebSite en un seul bloc, pour la home. */
export function siteIdentityJsonLd(opts?: { description?: string }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(opts), webSiteJsonLd()],
  }
}

export function eventToJsonLd(event: Event, opts?: { placeholderImage?: string }) {
  const info = getLocationInfo(event)
  const region = regionLabel(info.region)
  const locationName = clean(info.locationName)
  const cityName = clean(info.cityName)
  const image = eventImageUrl(event, opts?.placeholderImage)
  const priceValue = parsePrice(event.price)
  const eventUrl = `${SITE_URL}${buildEventUrl(event)}`
  // `offers.url` doit être une URL valide : un `ticketing_url` illisible
  // (« Sur place », un @insta) est remplacé par la page événement, qui porte
  // elle aussi l'info billetterie. Mieux qu'une offre publiée avec une URL
  // invalide, et mieux qu'un prix perdu faute d'offre.
  const ticketingUrl = normalizeTicketingUrl(event.ticketing_url)
  const hasOffer = Boolean(ticketingUrl) || priceValue !== undefined
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
    url: eventUrl,
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
            url: ticketingUrl ?? eventUrl,
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
    ...(events.length ? { event: events.map((event) => eventToJsonLd(event, opts)) } : {}),
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

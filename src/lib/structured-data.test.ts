import { describe, expect, it } from 'vitest'
import {
  eventJsonLd,
  eventToJsonLd,
  eventsItemListJsonLd,
  musicVenueJsonLd,
} from './structured-data'
import type { Event, Location } from '@/payload-types'

const atabal = {
  id: 'loc1',
  name: 'Atabal',
  slug: 'atabal',
  'city V2': { id: 'c1', name: 'Biarritz', slug: 'biarritz', region: 'pays-basque' },
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt1',
    title: 'Concert de test',
    slug: 'concert-de-test',
    date: '2026-09-21T14:00:00.000Z',
    time: '20h30',
    location: atabal,
    ...overrides,
  } as unknown as Event
}

describe('eventToJsonLd', () => {
  it('publishes the time shown on the page, not the arbitrary one stored on `date`', () => {
    expect(eventToJsonLd(makeEvent()).startDate).toBe('2026-09-21T20:30:00+02:00')
  })

  it('falls back to the day alone when no time is known', () => {
    expect(eventToJsonLd(makeEvent({ time: null })).startDate).toBe('2026-09-21')
  })

  it('types a referenced venue as MusicVenue', () => {
    const data = eventToJsonLd(makeEvent()) as { location: Record<string, unknown> }
    expect(data.location['@type']).toBe('MusicVenue')
    expect(data.location.name).toBe('Atabal')
    expect(data.location.address).toMatchObject({
      addressLocality: 'Biarritz',
      addressRegion: 'Pays Basque',
      addressCountry: 'FR',
    })
  })

  it('keeps a free-text venue as a generic Place', () => {
    const event = makeEvent({ location: null, location_alt: 'Chez Machin', region: 'landes' })
    const data = eventToJsonLd(event) as { location: Record<string, unknown> }
    expect(data.location['@type']).toBe('Place')
  })

  it('puts genres in `genre` and never invents a performer', () => {
    const data = eventToJsonLd(makeEvent({ genres: 'Deep House, Techno' }))
    expect(data).toMatchObject({ genre: ['Deep House', 'Techno'] })
    expect(data).not.toHaveProperty('performer')
  })

  it('falls back to categories when the free-text genre is empty', () => {
    const event = makeEvent({
      genres: null,
      category: [{ id: 'cat1', name: 'Folk/Chanson', slug: 'folk-chanson' }],
    } as Partial<Event>)
    expect(eventToJsonLd(event)).toMatchObject({ genre: ['Folk/Chanson'] })
  })

  it('omits `genre` entirely when nothing is known', () => {
    expect(eventToJsonLd(makeEvent({ genres: null, category: [] }))).not.toHaveProperty('genre')
  })

  it('carries no @context — it belongs to the published root', () => {
    expect(eventToJsonLd(makeEvent())).not.toHaveProperty('@context')
  })
})

describe('eventJsonLd', () => {
  it('is the same event, publishable on its own', () => {
    const event = makeEvent()
    expect(eventJsonLd(event)).toEqual({
      '@context': 'https://schema.org',
      ...eventToJsonLd(event),
    })
  })
})

describe('eventsItemListJsonLd', () => {
  it('keeps one @context at the list root only', () => {
    const list = eventsItemListJsonLd([makeEvent()]) as {
      '@context': string
      itemListElement: Array<{ item: Record<string, unknown> }>
    }
    expect(list['@context']).toBe('https://schema.org')
    expect(list.itemListElement[0].item).not.toHaveProperty('@context')
    expect(list.itemListElement[0].item.startDate).toBe('2026-09-21T20:30:00+02:00')
  })
})

function lexical(text: string) {
  return { root: { children: [{ type: 'paragraph', version: 1, children: [{ text }] }] } }
}

const venue = {
  ...atabal,
  description_V2: lexical('Salle de musiques actuelles à Biarritz.'),
  place_id: 'ChIJ_fake_place_id',
  image: { url: '/api/medias/file/atabal.jpg' },
} as unknown as Location

const venueOpts = {
  url: 'https://goazen.info/concerts/pays-basque/biarritz/atabal',
  region: 'pays-basque',
}

describe('musicVenueJsonLd', () => {
  it('describes the venue and its city', () => {
    expect(musicVenueJsonLd(venue, [], venueOpts)).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'MusicVenue',
      name: 'Atabal',
      url: venueOpts.url,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Biarritz',
        addressRegion: 'Pays Basque',
        addressCountry: 'FR',
      },
    })
  })

  it('flattens the Lexical description instead of publishing the raw object', () => {
    const data = musicVenueJsonLd(venue, [], venueOpts)
    expect(data.description).toBe('Salle de musiques actuelles à Biarritz.')
  })

  it('drops the invented opening hours, the empty geo and the fake parent org', () => {
    const data = musicVenueJsonLd(venue, [], venueOpts)
    expect(data).not.toHaveProperty('openingHoursSpecification')
    expect(data).not.toHaveProperty('geo')
    expect(data).not.toHaveProperty('parentOrganization')
  })

  it('lists the events through the shared event builder', () => {
    const event = makeEvent()
    const data = musicVenueJsonLd(venue, [event], venueOpts) as { event: Record<string, unknown>[] }
    expect(data.event).toHaveLength(1)
    expect(data.event[0]).toMatchObject(eventToJsonLd(event))
  })

  it('omits `event` entirely rather than publishing an empty list', () => {
    expect(musicVenueJsonLd(venue, [], venueOpts)).not.toHaveProperty('event')
  })

  it('falls back to the legacy `city` enum and the route region', () => {
    const legacy = {
      id: 'loc2',
      name: 'La Luna Negra',
      slug: 'la-luna-negra',
      city: 'bayonne',
      'city V2': null,
    } as unknown as Location
    expect(musicVenueJsonLd(legacy, [], { url: 'https://goazen.info/x', region: 'pays-basque' })).toMatchObject({
      address: { addressLocality: 'Bayonne', addressRegion: 'Pays Basque' },
    })
  })
})
